import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Date, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class DailyCheckIn(Base):
    """
    DailyCheckIn model representing a parent's general daily check-in for a child.
    """
    __tablename__ = "daily_check_ins"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    child_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("children.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    check_in_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )
    overall_mood: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    general_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    child: Mapped["Child"] = relationship("Child", back_populates="check_ins")
    behavior_events: Mapped[List["BehaviorEvent"]] = relationship(
        "BehaviorEvent",
        back_populates="check_in",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<DailyCheckIn id={self.id} date={self.check_in_date} mood={self.overall_mood}>"


class BehaviorEvent(Base):
    """
    BehaviorEvent model representing a specific behavioral situation recorded during a check-in.
    """
    __tablename__ = "behavior_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    check_in_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("daily_check_ins.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    emotion: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    intensity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    trigger: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    behavior_description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    parent_response: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    outcome: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    event_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationship
    check_in: Mapped["DailyCheckIn"] = relationship("DailyCheckIn", back_populates="behavior_events")

    def __repr__(self) -> str:
        return f"<BehaviorEvent id={self.id} emotion={self.emotion} intensity={self.intensity}>"
