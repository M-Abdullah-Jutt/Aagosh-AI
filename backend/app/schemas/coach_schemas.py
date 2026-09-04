from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict


class CoachRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Parent's question or statement")
    period: str = Field("30d", description="Analytics window period (e.g. 7d, 14d, 30d, 90d, all)")

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or whitespace only")
        return stripped

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        valid_periods = {"7d", "14d", "30d", "90d", "all"}
        if v not in valid_periods:
            raise ValueError(f"Period must be one of {valid_periods}")
        return v


class SourceReference(BaseModel):
    source: str
    page: Optional[int] = None
    category: Optional[str] = None


class ContextUsed(BaseModel):
    child_age: Optional[str] = None
    goal: Optional[str] = None
    relevant_observations: Optional[str] = None


class CoachMetadata(BaseModel):
    retrieval_count: int = 0
    model: Optional[str] = None
    provider: Optional[str] = None


class CoachResponse(BaseModel):
    answer: str
    key_points: List[str] = Field(default_factory=list)
    suggested_steps: List[str] = Field(default_factory=list)
    context_used: Optional[ContextUsed] = None
    source_references: List[SourceReference] = Field(default_factory=list)
    disclaimer: str = "This guidance is based on the parenting resources available in Aaghosh AI and is not a clinical diagnosis."
    metadata: CoachMetadata


class RawLLMOutput(BaseModel):
    """
    Schema expected directly from the LLM generation step.
    """
    answer: str
    key_points: List[str] = Field(default_factory=list)
    suggested_steps: List[str] = Field(default_factory=list)


# -------------------------------------------------------------------
# Conversation & Message Schemas (Step 8C)
# -------------------------------------------------------------------

class ConversationCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="Optional title for the conversation")


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    title: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Parent's question or statement")
    period: str = Field("30d", description="Analytics window period (7d, 14d, 30d, 90d, all)")

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or whitespace only")
        return stripped

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        valid_periods = {"7d", "14d", "30d", "90d", "all"}
        if v not in valid_periods:
            raise ValueError(f"Period must be one of {valid_periods}")
        return v


class MessageItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    source_references: List[SourceReference] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    # Enhanced fields for assistant responses
    answer: Optional[str] = None
    key_points: List[str] = Field(default_factory=list)
    suggested_steps: List[str] = Field(default_factory=list)
    disclaimer: Optional[str] = None
    context_used: Optional[ContextUsed] = None


class ConversationDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    child_id: str
    title: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageItemResponse] = Field(default_factory=list)
