from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# Allowed Goal Types
VALID_GOAL_TYPES = {
    "emotional_regulation",
    "communication",
    "confidence",
    "discipline",
    "sleep",
    "school",
    "social_skills",
    "screen_time",
    "parent_child_relationship",
    "other",
}

# Allowed Priorities
VALID_PRIORITIES = {"low", "medium", "high"}


# ----------------------------------------------------
# Child Profile Schemas
# ----------------------------------------------------
class ChildProfileCreate(BaseModel):
    strengths: Optional[str] = Field(None, max_length=2000, description="Parent observed strengths")
    challenges: Optional[str] = Field(None, max_length=2000, description="Parent observed challenges")
    personality_notes: Optional[str] = Field(None, max_length=2000, description="Parent observed personality notes")
    communication_style: Optional[str] = Field(None, max_length=2000, description="Parent observed communication style")


class ChildProfileUpdate(BaseModel):
    strengths: Optional[str] = Field(None, max_length=2000)
    challenges: Optional[str] = Field(None, max_length=2000)
    personality_notes: Optional[str] = Field(None, max_length=2000)
    communication_style: Optional[str] = Field(None, max_length=2000)


class ChildProfileResponse(BaseModel):
    id: str
    child_id: str
    strengths: Optional[str] = None
    challenges: Optional[str] = None
    personality_notes: Optional[str] = None
    communication_style: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ----------------------------------------------------
# Parenting Goal Schemas
# ----------------------------------------------------
class ParentingGoalCreate(BaseModel):
    goal_type: str = Field(..., description="Type of parenting goal")
    description: Optional[str] = Field(None, max_length=1000, description="Goal description or details")
    priority: str = Field("medium", description="Priority level: low, medium, or high")

    @field_validator("goal_type")
    @classmethod
    def validate_goal_type(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in VALID_GOAL_TYPES:
            raise ValueError(f"Invalid goal_type. Allowed types: {', '.join(sorted(VALID_GOAL_TYPES))}")
        return normalized

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority. Allowed priorities: {', '.join(sorted(VALID_PRIORITIES))}")
        return normalized


class ParentingGoalUpdate(BaseModel):
    goal_type: Optional[str] = None
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("goal_type")
    @classmethod
    def validate_goal_type(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip().lower()
        if normalized not in VALID_GOAL_TYPES:
            raise ValueError(f"Invalid goal_type. Allowed types: {', '.join(sorted(VALID_GOAL_TYPES))}")
        return normalized

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip().lower()
        if normalized not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority. Allowed priorities: {', '.join(sorted(VALID_PRIORITIES))}")
        return normalized


class ParentingGoalResponse(BaseModel):
    id: str
    child_id: str
    goal_type: str
    description: Optional[str] = None
    priority: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ----------------------------------------------------
# Child Schemas
# ----------------------------------------------------
class ChildCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="Child's first name")
    date_of_birth: date = Field(..., description="Child's date of birth")
    gender: Optional[str] = Field(None, max_length=50, description="Gender (optional)")
    profile: Optional[ChildProfileCreate] = None
    goals: Optional[List[ParentingGoalCreate]] = None

    @field_validator("first_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("First name cannot be empty")
        return trimmed

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value


class ChildUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=50)

    @field_validator("first_name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("First name cannot be empty")
        return trimmed

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value: Optional[date]) -> Optional[date]:
        if value and value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value


class ChildResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    date_of_birth: date
    gender: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    age_display: Optional[str] = None
    active_goals_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class ChildWithDetailsResponse(ChildResponse):
    profile: Optional[ChildProfileResponse] = None
    goals: List[ParentingGoalResponse] = []
