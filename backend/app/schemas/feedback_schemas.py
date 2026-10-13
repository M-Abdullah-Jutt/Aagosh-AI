from typing import Optional
from pydantic import BaseModel, Field


class CreateFeedbackRequest(BaseModel):
    module: str = Field(..., description="'ai_chat_coach' or 'parent_practice'")
    is_helpful: bool = Field(..., description="True if helpful, False if not helpful")
    target_id: Optional[str] = Field(None, description="Message ID, conversation ID, or scenario ID")
    child_id: Optional[str] = Field(None, description="Optional child ID")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Optional rating 1-5")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional parent text feedback")


class FeedbackResponse(BaseModel):
    id: str
    module: str
    is_helpful: bool
    message: str = "Feedback submitted successfully"
