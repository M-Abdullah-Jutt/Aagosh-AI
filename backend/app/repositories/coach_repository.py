import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.coach import CoachConversation, CoachMessage

logger = logging.getLogger(__name__)


class CoachRepository:
    """
    Data Access Repository for Coach Conversations and Coach Messages.
    """

    @staticmethod
    def create_conversation(
        db: Session,
        user_id: str,
        child_id: str,
        title: Optional[str] = None
    ) -> CoachConversation:
        conversation = CoachConversation(
            user_id=user_id,
            child_id=child_id,
            title=title or "New Conversation",
            is_active=True
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def get_conversations_by_child(
        db: Session,
        user_id: str,
        child_id: str,
        active_only: bool = True
    ) -> List[CoachConversation]:
        query = db.query(CoachConversation).filter(
            CoachConversation.user_id == user_id,
            CoachConversation.child_id == child_id
        )
        if active_only:
            query = query.filter(CoachConversation.is_active == True)
        
        return query.order_by(CoachConversation.updated_at.desc()).all()

    @staticmethod
    def get_conversation_by_id(
        db: Session,
        conversation_id: str,
        user_id: str,
        child_id: str
    ) -> Optional[CoachConversation]:
        return db.query(CoachConversation).filter(
            CoachConversation.id == conversation_id,
            CoachConversation.user_id == user_id,
            CoachConversation.child_id == child_id
        ).first()

    @staticmethod
    def archive_conversation(
        db: Session,
        conversation: CoachConversation
    ) -> CoachConversation:
        conversation.is_active = False
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def touch_conversation(
        db: Session,
        conversation: CoachConversation,
        title: Optional[str] = None
    ) -> None:
        conversation.updated_at = datetime.utcnow()
        if title and (not conversation.title or conversation.title == "New Conversation"):
            conversation.title = title
        db.commit()
        db.refresh(conversation)

    @staticmethod
    def add_message(
        db: Session,
        conversation_id: str,
        role: str,
        content: str,
        source_references: Optional[List[Dict[str, Any]]] = None,
        metadata_info: Optional[Dict[str, Any]] = None
    ) -> CoachMessage:
        msg = CoachMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            source_references=source_references,
            metadata_info=metadata_info
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_messages_for_conversation(
        db: Session,
        conversation_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[CoachMessage]:
        return (
            db.query(CoachMessage)
            .filter(CoachMessage.conversation_id == conversation_id)
            .order_by(CoachMessage.created_at.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_recent_messages(
        db: Session,
        conversation_id: str,
        limit: int = 10
    ) -> List[CoachMessage]:
        """
        Retrieves the latest 'limit' messages ordered chronologically (oldest to newest).
        """
        recent = (
            db.query(CoachMessage)
            .filter(CoachMessage.conversation_id == conversation_id)
            .order_by(CoachMessage.created_at.desc())
            .limit(limit)
            .all()
        )
        # Reverse so they are in chronological order
        return list(reversed(recent))


coach_repository = CoachRepository()
