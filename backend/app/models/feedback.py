import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Integer, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class GuidanceFeedback(Base):
    """
    Records parent feedback (Helpful / Not Helpful, ratings, comments)
    across all guidance modules: AI Chat Coach and Parent Practice Session.
    """
    __tablename__ = "guidance_feedback"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    module: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False  # 'ai_chat_coach' or 'parent_practice'
    )
    target_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True  # message_id, conversation_id, or scenario_id
    )
    child_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True
    )
    is_helpful: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )
    rating: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True  # 1 to 5 scale
    )
    comment: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
