import logging
import time
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.child import Child
from app.repositories.coach_repository import coach_repository
from app.services.context_assembly_service import ContextAssemblyService
from app.coach.sanitizer import LLMContextSanitizer
from app.coach.prompt_builder import ParentingPromptBuilder
from app.coach.llm_provider import (
    LLMProvider,
    MockLLMProvider,
    get_llm_provider,
    LLMTimeoutException,
    LLMAuthenticationException,
    LLMRateLimitException,
    LLMProviderException
)
from app.coach.safety import ParentingSafetyValidator
from app.coach.languages import (
    DEFAULT_LANGUAGE,
    get_strings,
    normalize_language,
)
from app.schemas.coach_schemas import (
    CoachResponse,
    ContextUsed,
    CoachMetadata,
    RawLLMOutput,
    ConversationResponse,
    ConversationDetailResponse,
    MessageItemResponse,
    SourceReference
)

logger = logging.getLogger(__name__)


def generate_title_from_message(message: str) -> str:
    """
    Generates a short deterministic conversation title from the first user question.
    Does NOT call the LLM for title generation.
    """
    words = message.strip().split()
    if not words:
        return "New Conversation"
    title_words = words[:5]
    raw_title = " ".join(title_words)
    if len(raw_title) > 35:
        raw_title = raw_title[:32] + "..."
    return raw_title.capitalize()


class ParentingCoachService:
    """
    Main orchestration service for Grounded LLM Response Generation and Conversation Management (Step 8C).
    """

    def _verify_child_ownership(self, db: Session, child_id: str, parent_user_id: str) -> Child:
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found."
            )
        if str(child.user_id) != str(parent_user_id):
            logger.warning(f"[Coach Service] Unauthorized child access attempt: child_id={child_id}, user_id={parent_user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You do not own this child profile."
            )
        return child

    def _verify_conversation_ownership(self, db: Session, conversation_id: str, parent_user_id: str, child_id: str):
        conversation = coach_repository.get_conversation_by_id(
            db=db,
            conversation_id=conversation_id,
            user_id=str(parent_user_id),
            child_id=str(child_id)
        )
        if not conversation:
            logger.warning(f"[Coach Service] Conversation not found or access denied: conversation_id={conversation_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found."
            )
        return conversation

    # -------------------------------------------------------------------
    # Conversation Management Methods
    # -------------------------------------------------------------------

    def create_conversation(
        self,
        db: Session,
        parent_user_id: str,
        child_id: str,
        title: Optional[str] = None
    ) -> ConversationResponse:
        self._verify_child_ownership(db, child_id, parent_user_id)
        conv = coach_repository.create_conversation(
            db=db,
            user_id=str(parent_user_id),
            child_id=str(child_id),
            title=title or "New Conversation"
        )
        return ConversationResponse.model_validate(conv)

    def list_conversations(
        self,
        db: Session,
        parent_user_id: str,
        child_id: str
    ) -> List[ConversationResponse]:
        self._verify_child_ownership(db, child_id, parent_user_id)
        convs = coach_repository.get_conversations_by_child(
            db=db,
            user_id=str(parent_user_id),
            child_id=str(child_id),
            active_only=True
        )
        return [ConversationResponse.model_validate(c) for c in convs]

    def get_conversation_detail(
        self,
        db: Session,
        parent_user_id: str,
        child_id: str,
        conversation_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> ConversationDetailResponse:
        self._verify_child_ownership(db, child_id, parent_user_id)
        conv = self._verify_conversation_ownership(db, conversation_id, parent_user_id, child_id)
        messages = coach_repository.get_messages_for_conversation(db, conversation_id, limit=limit, offset=offset)

        message_items = []
        for m in messages:
            sources = []
            if m.source_references:
                for s in m.source_references:
                    sources.append(SourceReference(**s))

            item = MessageItemResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                source_references=sources,
                metadata=m.metadata_info or {},
                created_at=m.created_at
            )
            if m.role == "assistant":
                item.answer = m.content
                if m.metadata_info:
                    item.key_points = m.metadata_info.get("key_points", [])
                    item.suggested_steps = m.metadata_info.get("suggested_steps", [])
                    item.disclaimer = m.metadata_info.get("disclaimer")
                    if m.metadata_info.get("context_used"):
                        item.context_used = ContextUsed(**m.metadata_info["context_used"])

            message_items.append(item)

        return ConversationDetailResponse(
            id=conv.id,
            child_id=conv.child_id,
            title=conv.title,
            is_active=conv.is_active,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            messages=message_items
        )

    def archive_conversation(
        self,
        db: Session,
        parent_user_id: str,
        child_id: str,
        conversation_id: str
    ) -> ConversationResponse:
        self._verify_child_ownership(db, child_id, parent_user_id)
        conv = self._verify_conversation_ownership(db, conversation_id, parent_user_id, child_id)
        archived = coach_repository.archive_conversation(db, conv)
        return ConversationResponse.model_validate(archived)

    # -------------------------------------------------------------------
    # Message Generation within Session (Step 8C)
    # -------------------------------------------------------------------

    def send_message_in_conversation(
        self,
        db: Session,
        parent_user_id: str,
        child_id: str,
        conversation_id: str,
        message_text: str,
        period: str = "30d",
        language: str = DEFAULT_LANGUAGE,
        llm_provider: Optional[LLMProvider] = None
    ) -> CoachResponse:
        start_time = time.time()
        resolved_language = normalize_language(language)
        strings = get_strings(resolved_language)
        self._verify_child_ownership(db, child_id, parent_user_id)
        conv = self._verify_conversation_ownership(db, conversation_id, parent_user_id, child_id)

        # Auto-update title if default
        new_title = generate_title_from_message(message_text)
        coach_repository.touch_conversation(db, conv, title=new_title)

        # Load latest MAX_CONVERSATION_MESSAGES for LLM dialogue context
        max_msgs = getattr(settings, "MAX_CONVERSATION_MESSAGES", 10)
        history_msgs = coach_repository.get_recent_messages(db, conversation_id, limit=max_msgs)

        formatted_history = []
        for m in history_msgs:
            formatted_history.append({"role": m.role, "content": m.content})

        # Fresh Step 8A Context Assembly & Fresh RAG retrieval for current message
        assembled_obj = ContextAssemblyService.build_context(
            db=db,
            child_id=str(child_id),
            user_id=str(parent_user_id),
            query=message_text,
            period=period
        )
        if hasattr(assembled_obj, "model_dump"):
            assembled_context = assembled_obj.model_dump()
        elif hasattr(assembled_obj, "dict"):
            assembled_context = assembled_obj.dict()
        else:
            assembled_context = assembled_obj

        retrieved_knowledge = assembled_context.get("retrieved_knowledge", [])
        retrieval_count = len(retrieved_knowledge)

        # Context Sanitization
        sanitized_context = LLMContextSanitizer.sanitize(assembled_context)

        # Prompt Construction with conversation history
        system_prompt, user_prompt = ParentingPromptBuilder.build_prompts(
            parent_message=message_text,
            sanitized_context=sanitized_context,
            conversation_history=formatted_history,
            language=resolved_language
        )

        # LLM Provider Execution
        provider = llm_provider or get_llm_provider()
        logger.info(f"[Coach Service] Invoking provider '{provider.provider_name}' for conversation_id={conversation_id}")

        try:
            raw_output = provider.generate_response(
                system_prompt, user_prompt, sanitized_context, language=resolved_language
            )
        except LLMTimeoutException as e:
            logger.error(f"[Coach Service] Timeout: {e}")
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="The AI response service timed out.")
        except LLMAuthenticationException as e:
            logger.error(f"[Coach Service] Auth error: {e}")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service authentication error.")
        except LLMRateLimitException as e:
            logger.warning(f"[Coach Service] Rate limit hit on provider '{provider.provider_name}': {e}.")
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="AI service rate limit exceeded. Please try again in a few moments.")
        except LLMProviderException as e:
            logger.error(f"[Coach Service] Provider error: {e}")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to generate AI response from provider.")
        except Exception as e:
            logger.error(f"[Coach Service] Execution failure: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error occurred.")

        # Schema Validation
        try:
            validated_output = RawLLMOutput(**raw_output)
        except Exception as e:
            logger.error(f"[Coach Service] Schema validation error: {e}")
            validated_output = RawLLMOutput(
                answer=strings["format_error"],
                key_points=[],
                suggested_steps=[]
            )

        # Safety Validation
        output_dict = validated_output.model_dump() if hasattr(validated_output, "model_dump") else validated_output.dict()
        is_safe, safety_violations = ParentingSafetyValidator.validate_response(output_dict, retrieved_knowledge)

        if not is_safe:
            logger.warning(f"[Coach Service] Safety validation failed. Violations: {safety_violations}")
            validated_output = RawLLMOutput(
                answer=strings["safety_block_answer"],
                key_points=list(strings["safety_block_key_points"]),
                suggested_steps=list(strings["safety_block_steps"])
            )

        # Programmatic Source References Generation
        source_references = ParentingSafetyValidator.generate_programmatic_citations(retrieved_knowledge)
        source_refs_data = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in source_references]

        # Summarize context used
        child_age_str = f"{sanitized_context['child'].get('age_years', 0)} years"
        goals_summary = ", ".join(sanitized_context.get("goals", [])) or "None active"
        obs_summary = "; ".join(sanitized_context.get("recent_observations", [])) or "None recent"

        context_used = ContextUsed(
            child_age=child_age_str,
            goal=goals_summary,
            relevant_observations=obs_summary
        )

        metadata_dict = {
            "retrieval_count": retrieval_count,
            "model": provider.model_name,
            "provider": provider.provider_name,
            "language": resolved_language,
            "key_points": validated_output.key_points,
            "suggested_steps": validated_output.suggested_steps,
            "disclaimer": strings["disclaimer"],
            "context_used": context_used.model_dump() if hasattr(context_used, "model_dump") else context_used.dict()
        }

        # Persist Messages in DB
        coach_repository.add_message(
            db=db,
            conversation_id=conversation_id,
            role="user",
            content=message_text
        )

        coach_repository.add_message(
            db=db,
            conversation_id=conversation_id,
            role="assistant",
            content=validated_output.answer,
            source_references=source_refs_data,
            metadata_info=metadata_dict
        )

        duration = time.time() - start_time
        logger.info(f"[Coach Service] Message processed and saved in {duration:.2f}s")

        return CoachResponse(
            answer=validated_output.answer,
            key_points=validated_output.key_points,
            suggested_steps=validated_output.suggested_steps,
            context_used=context_used,
            source_references=source_references,
            metadata=CoachMetadata(
                retrieval_count=retrieval_count,
                model=provider.model_name,
                provider=provider.provider_name
            )
        )

    # Legacy / Direct Response Generation (Step 8B compatibility)
    def generate_response(
        self,
        db: Session,
        child_id: str,
        parent_user_id: str,
        parent_message: str,
        period: str = "30d",
        language: str = DEFAULT_LANGUAGE,
        llm_provider: Optional[LLMProvider] = None
    ) -> CoachResponse:
        resolved_language = normalize_language(language)
        strings = get_strings(resolved_language)
        self._verify_child_ownership(db, child_id, parent_user_id)

        assembled_obj = ContextAssemblyService.build_context(
            db=db,
            child_id=str(child_id),
            user_id=str(parent_user_id),
            query=parent_message,
            period=period
        )
        assembled_context = assembled_obj.model_dump() if hasattr(assembled_obj, "model_dump") else assembled_obj.dict()

        retrieved_knowledge = assembled_context.get("retrieved_knowledge", [])
        retrieval_count = len(retrieved_knowledge)

        sanitized_context = LLMContextSanitizer.sanitize(assembled_context)
        system_prompt, user_prompt = ParentingPromptBuilder.build_prompts(
            parent_message, sanitized_context, language=resolved_language
        )

        provider = llm_provider or get_llm_provider()

        try:
            raw_output = provider.generate_response(
                system_prompt, user_prompt, sanitized_context, language=resolved_language
            )
        except LLMTimeoutException as e:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="The AI response service timed out.")
        except LLMAuthenticationException as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service authentication error.")
        except LLMRateLimitException as e:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="AI service rate limit exceeded.")
        except LLMProviderException as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to generate AI response from provider.")

        try:
            validated_output = RawLLMOutput(**raw_output)
        except Exception:
            validated_output = RawLLMOutput(
                answer=strings["format_error"],
                key_points=[],
                suggested_steps=[]
            )

        output_dict = validated_output.model_dump() if hasattr(validated_output, "model_dump") else validated_output.dict()
        is_safe, safety_violations = ParentingSafetyValidator.validate_response(output_dict, retrieved_knowledge)

        if not is_safe:
            validated_output = RawLLMOutput(
                answer=strings["safety_block_answer"],
                key_points=list(strings["safety_block_key_points"]),
                suggested_steps=list(strings["safety_block_steps"])
            )

        source_references = ParentingSafetyValidator.generate_programmatic_citations(retrieved_knowledge)

        child_age_str = f"{sanitized_context['child'].get('age_years', 0)} years"
        goals_summary = ", ".join(sanitized_context.get("goals", [])) or "None active"
        obs_summary = "; ".join(sanitized_context.get("recent_observations", [])) or "None recent"

        context_used = ContextUsed(
            child_age=child_age_str,
            goal=goals_summary,
            relevant_observations=obs_summary
        )

        return CoachResponse(
            answer=validated_output.answer,
            key_points=validated_output.key_points,
            suggested_steps=validated_output.suggested_steps,
            context_used=context_used,
            source_references=source_references,
            metadata=CoachMetadata(
                retrieval_count=retrieval_count,
                model=provider.model_name,
                provider=provider.provider_name
            )
        )


coach_service = ParentingCoachService()
