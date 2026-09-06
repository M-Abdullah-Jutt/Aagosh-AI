import uuid
from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Date, Text, Boolean, DateTime, ForeignKey, func, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.coach import CoachConversation


class Child(Base):
    """
    Child model representing a child registered under a parent account.
    """
    __tablename__ = "children"

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
    first_name: Mapped[str] = mapped_column(
        Unicode(100),
        nullable=False
    )
    date_of_birth: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )
    gender: Mapped[Optional[str]] = mapped_column(
        String(50),
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
    user: Mapped["User"] = relationship("User", back_populates="children")
    profile: Mapped[Optional["ChildProfile"]] = relationship(
        "ChildProfile",
        back_populates="child",
        uselist=False,
        cascade="all, delete-orphan"
    )
    goals: Mapped[List["ParentingGoal"]] = relationship(
        "ParentingGoal",
        back_populates="child",
        cascade="all, delete-orphan"
    )
    check_ins: Mapped[List["DailyCheckIn"]] = relationship(
        "DailyCheckIn",
        back_populates="child",
        cascade="all, delete-orphan"
    )
    coach_conversations: Mapped[List["CoachConversation"]] = relationship(
        "CoachConversation",
        back_populates="child",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Child id={self.id} name={self.first_name} user_id={self.user_id}>"


class ChildProfile(Base):
    """
    ChildProfile model containing non-clinical parent observations about a child.
    """
    __tablename__ = "child_profiles"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    child_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("children.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )
    strengths: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
        nullable=True
    )
    challenges: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
        nullable=True
    )
    personality_notes: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
        nullable=True
    )
    communication_style: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
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
    child: Mapped["Child"] = relationship("Child", back_populates="profile")

    def __repr__(self) -> str:
        return f"<ChildProfile id={self.id} child_id={self.child_id}>"


class ParentingGoal(Base):
    """
    ParentingGoal model representing active and historical parenting targets for a child.
    """
    __tablename__ = "parenting_goals"

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
    goal_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        UnicodeText,
        nullable=True
    )
    priority: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
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
    child: Mapped["Child"] = relationship("Child", back_populates="goals")

    def __repr__(self) -> str:
        return f"<ParentingGoal id={self.id} type={self.goal_type} active={self.is_active}>"
