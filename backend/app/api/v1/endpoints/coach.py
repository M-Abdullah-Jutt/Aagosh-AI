import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.child import Child
from app.api.deps import get_current_user
from app.schemas.coach_schemas import (
    CoachRequest,
    CoachResponse,
    ConversationCreate,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreate,
    MessageItemResponse
)
from app.coach.service import coach_service
from app.repositories.coach_repository import coach_repository

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/children/{child_id}/coach/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new coach conversation for a child",
    description="Creates a new persistent conversation session for a child belonging to the authenticated parent."
)
def create_conversation(
    payload: Optional[ConversationCreate] = None,
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ConversationResponse:
    title = payload.title if payload else None
    return coach_service.create_conversation(
        db=db,
        parent_user_id=current_user.id,
        child_id=child_id,
        title=title
    )


@router.post(
    "/children/{child_id}/coach/conversations/{conversation_id}/initialize",
    response_model=MessageItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Auto-initialize a conversation with an AI welcome message",
    description=(
        "Generates and persists an initial AI assistant message for a newly created conversation, "
        "tailored to the child's profile, goals, and observations. Asks the parent about daily emotional triggers."
    )
)
def initialize_conversation(
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    conversation_id: str = Path(..., min_length=1, description="The ID of the conversation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> MessageItemResponse:
    """
    Produces a warm, personalized AI opening message based on:
    - Child's name, age, profile strengths/challenges
    - Active parenting goals
    - Whether check-in data exists
    Then asks the parent about daily emotional triggers.
    """
    # Verify child ownership
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")
    if str(child.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Verify conversation ownership
    conv = coach_repository.get_conversation_by_id(
        db=db, conversation_id=conversation_id,
        user_id=str(current_user.id), child_id=str(child_id)
    )
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    # Check there are no messages yet (avoid re-initializing)
    existing = coach_repository.get_messages_for_conversation(db, conversation_id, limit=1, offset=0)
    if existing:
        m = existing[0]
        return MessageItemResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=m.content,
            source_references=[],
            metadata=m.metadata_info or {},
            created_at=m.created_at
        )

    # Build personalized welcome message
    child_name = child.first_name or "your child"
    age_years = getattr(child, "age_years", None)
    age_str = f"{age_years} years old" if age_years is not None else "at their age"

    # Pull profile details if present
    profile = getattr(child, "profile", None)
    strengths_snippet = ""
    challenges_snippet = ""
    if profile:
        if getattr(profile, "strengths", None):
            strengths_snippet = f" I can see you've noted some strengths for {child_name}: {profile.strengths[:100]}."
        if getattr(profile, "challenges", None):
            challenges_snippet = f" You've also mentioned some growth areas: {profile.challenges[:100]}."

    # Pull active goals
    goals = getattr(child, "goals", []) or []
    active_goals = [g for g in goals if getattr(g, "is_active", False)]
    goals_text = ""
    if active_goals:
        goal_labels = [g.goal_type.replace("_", " ").title() for g in active_goals[:3]]
        goals_text = f" Your active parenting focus areas include: {', '.join(goal_labels)}."

    welcome_text = (
        f"Hi! I'm Aaghosh AI, your personal parenting companion.\n\n"
        f"I'm here to support you with evidence-informed guidance tailored to {child_name}, "
        f"who is {age_str}.{strengths_snippet}{challenges_snippet}{goals_text}\n\n"
        f"To give you the most helpful guidance, I'd love to understand {child_name}'s daily patterns better. "
        f"Could you tell me about any emotional triggers or challenging situations you've been observing lately? "
        f"For example: transitions (ending screen time, bedtime), mealtimes, sibling interactions, "
        f"or moments when strong emotions tend to arise.\n\n"
        f"You can also ask me anything directly — about behavior, routines, communication, or anything "
        f"on your mind as a parent. I'm here to help!"
    )

    # Persist as assistant message
    saved_msg = coach_repository.add_message(
        db=db,
        conversation_id=conversation_id,
        role="assistant",
        content=welcome_text,
        source_references=[],
        metadata_info={
            "key_points": [],
            "suggested_steps": [],
            "disclaimer": "Aaghosh AI is not a medical or clinical tool.",
            "provider": "system",
            "model": "welcome-init"
        }
    )

    return MessageItemResponse(
        id=saved_msg.id,
        conversation_id=saved_msg.conversation_id,
        role=saved_msg.role,
        content=saved_msg.content,
        source_references=[],
        metadata=saved_msg.metadata_info or {},
        created_at=saved_msg.created_at
    )


@router.get(
    "/children/{child_id}/coach/conversations",
    response_model=List[ConversationResponse],
    status_code=status.HTTP_200_OK,
    summary="List active coach conversations for a child",
    description="Retrieves all active conversations for a specific child belonging to the authenticated parent."
)
def list_conversations(
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[ConversationResponse]:
    return coach_service.list_conversations(
        db=db,
        parent_user_id=current_user.id,
        child_id=child_id
    )


@router.get(
    "/children/{child_id}/coach/conversations/{conversation_id}",
    response_model=ConversationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get conversation detail and messages",
    description="Retrieves metadata and paginated message history for a specific conversation session."
)
def get_conversation_detail(
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    conversation_id: str = Path(..., min_length=1, description="The ID of the conversation"),
    limit: int = Query(50, ge=1, le=100, description="Max messages to return"),
    offset: int = Query(0, ge=0, description="Message pagination offset"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ConversationDetailResponse:
    return coach_service.get_conversation_detail(
        db=db,
        parent_user_id=current_user.id,
        child_id=child_id,
        conversation_id=conversation_id,
        limit=limit,
        offset=offset
    )


@router.delete(
    "/children/{child_id}/coach/conversations/{conversation_id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive a coach conversation",
    description="Soft-deletes/archives a conversation session so it no longer appears in the active list."
)
def archive_conversation(
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    conversation_id: str = Path(..., min_length=1, description="The ID of the conversation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ConversationResponse:
    return coach_service.archive_conversation(
        db=db,
        parent_user_id=current_user.id,
        child_id=child_id,
        conversation_id=conversation_id
    )


@router.post(
    "/children/{child_id}/coach/conversations/{conversation_id}/messages",
    response_model=CoachResponse,
    status_code=status.HTTP_200_OK,
    summary="Send a message in a conversation session",
    description=(
        "Submits a parent message within an active conversation session, "
        "triggers RAG + context assembly, and returns a grounded response."
    )
)
def send_message_in_conversation(
    payload: MessageCreate,
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    conversation_id: str = Path(..., min_length=1, description="The ID of the conversation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CoachResponse:
    return coach_service.send_message_in_conversation(
        db=db,
        parent_user_id=current_user.id,
        child_id=child_id,
        conversation_id=conversation_id,
        message_text=payload.message,
        period=payload.period
    )


@router.post(
    "/children/{child_id}/coach",
    response_model=CoachResponse,
    status_code=status.HTTP_200_OK,
    summary="Direct grounded AI coach query",
    description=(
        "Direct query endpoint for generating grounded parenting responses "
        "without explicitly creating a conversation first."
    )
)
def generate_coach_response(
    request: CoachRequest,
    child_id: str = Path(..., min_length=1, description="The ID of the child"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CoachResponse:
    return coach_service.generate_response(
        db=db,
        child_id=child_id,
        parent_user_id=current_user.id,
        parent_message=request.message,
        period=request.period
    )
