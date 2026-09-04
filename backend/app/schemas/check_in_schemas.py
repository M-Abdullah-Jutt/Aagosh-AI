from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

# Controlled Value Sets
VALID_MOODS = {"good", "okay", "difficult"}
VALID_EMOTIONS = {"angry", "frustrated", "sad", "anxious", "excited", "calm", "other"}
VALID_TRIGGERS = {
    "screen_time",
    "homework",
    "bedtime",
    "sibling",
    "school",
    "meal",
    "transition",
    "parent_instruction",
    "other",
}
VALID_RESPONSES = {
    "talked_calmly",
    "set_boundary",
    "redirected",
    "gave_space",
    "negotiated",
    "ignored",
    "other",
}
VALID_OUTCOMES = {
    "calmed_down",
    "partially_improved",
    "no_change",
    "got_worse",
    "not_sure",
}


# ----------------------------------------------------
# Behavior Event Schemas
# ----------------------------------------------------
class BehaviorEventCreate(BaseModel):
    emotion: str = Field(..., description="Observed emotion")
    intensity: int = Field(..., ge=1, le=5, description="Behavioral reaction strength (1-5)")
    trigger: Optional[str] = Field(None, description="Perceived trigger")
    behavior_description: str = Field(..., min_length=1, max_length=2000, description="What happened during event")
    parent_response: Optional[str] = Field(None, description="What parent did in response")
    outcome: Optional[str] = Field(None, description="What happened afterward")
    event_notes: Optional[str] = Field(None, max_length=2000, description="Additional notes")

    @field_validator("emotion")
    @classmethod
    def validate_emotion(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in VALID_EMOTIONS:
            raise ValueError(f"Invalid emotion. Allowed: {', '.join(sorted(VALID_EMOTIONS))}")
        return normalized

    @field_validator("trigger")
    @classmethod
    def validate_trigger(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_TRIGGERS:
            raise ValueError(f"Invalid trigger. Allowed: {', '.join(sorted(VALID_TRIGGERS))}")
        return normalized

    @field_validator("parent_response")
    @classmethod
    def validate_parent_response(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_RESPONSES:
            raise ValueError(f"Invalid parent_response. Allowed: {', '.join(sorted(VALID_RESPONSES))}")
        return normalized

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_OUTCOMES:
            raise ValueError(f"Invalid outcome. Allowed: {', '.join(sorted(VALID_OUTCOMES))}")
        return normalized

    @field_validator("behavior_description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Behavior description cannot be blank")
        return trimmed


class BehaviorEventUpdate(BaseModel):
    emotion: Optional[str] = None
    intensity: Optional[int] = Field(None, ge=1, le=5)
    trigger: Optional[str] = None
    behavior_description: Optional[str] = Field(None, min_length=1, max_length=2000)
    parent_response: Optional[str] = None
    outcome: Optional[str] = None
    event_notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("emotion")
    @classmethod
    def validate_emotion(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        normalized = v.strip().lower()
        if normalized not in VALID_EMOTIONS:
            raise ValueError(f"Invalid emotion. Allowed: {', '.join(sorted(VALID_EMOTIONS))}")
        return normalized

    @field_validator("trigger")
    @classmethod
    def validate_trigger(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_TRIGGERS:
            raise ValueError(f"Invalid trigger. Allowed: {', '.join(sorted(VALID_TRIGGERS))}")
        return normalized

    @field_validator("parent_response")
    @classmethod
    def validate_parent_response(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_RESPONSES:
            raise ValueError(f"Invalid parent_response. Allowed: {', '.join(sorted(VALID_RESPONSES))}")
        return normalized

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        normalized = v.strip().lower()
        if normalized not in VALID_OUTCOMES:
            raise ValueError(f"Invalid outcome. Allowed: {', '.join(sorted(VALID_OUTCOMES))}")
        return normalized


class BehaviorEventResponse(BaseModel):
    id: str
    check_in_id: str
    emotion: str
    intensity: int
    trigger: Optional[str] = None
    behavior_description: str
    parent_response: Optional[str] = None
    outcome: Optional[str] = None
    event_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ----------------------------------------------------
# Daily Check-In Schemas
# ----------------------------------------------------
class DailyCheckInCreate(BaseModel):
    check_in_date: date = Field(..., description="Date of check-in")
    overall_mood: str = Field(..., description="Overall mood: good, okay, difficult")
    general_notes: Optional[str] = Field(None, max_length=3000, description="General notes about the day")
    events: Optional[List[BehaviorEventCreate]] = Field(default=[], description="Optional initial behavior events")

    @field_validator("overall_mood")
    @classmethod
    def validate_mood(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in VALID_MOODS:
            raise ValueError(f"Invalid overall_mood. Allowed: {', '.join(sorted(VALID_MOODS))}")
        return normalized

    @field_validator("check_in_date")
    @classmethod
    def validate_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Check-in date cannot be in the future")
        return v


class DailyCheckInUpdate(BaseModel):
    check_in_date: Optional[date] = None
    overall_mood: Optional[str] = None
    general_notes: Optional[str] = Field(None, max_length=3000)

    @field_validator("overall_mood")
    @classmethod
    def validate_mood(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        normalized = v.strip().lower()
        if normalized not in VALID_MOODS:
            raise ValueError(f"Invalid overall_mood. Allowed: {', '.join(sorted(VALID_MOODS))}")
        return normalized

    @field_validator("check_in_date")
    @classmethod
    def validate_date(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("Check-in date cannot be in the future")
        return v


class DailyCheckInResponse(BaseModel):
    id: str
    child_id: str
    check_in_date: date
    overall_mood: str
    general_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    events_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class DailyCheckInWithEventsResponse(DailyCheckInResponse):
    behavior_events: List[BehaviorEventResponse] = []
