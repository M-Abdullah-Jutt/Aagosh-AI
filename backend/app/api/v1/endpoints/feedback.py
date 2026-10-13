import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.feedback import GuidanceFeedback
from app.schemas.feedback_schemas import CreateFeedbackRequest, FeedbackResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit parent feedback on AI guidance",
    description="Records whether an AI Chat Coach response or Parent Practice session was helpful or not."
)
def submit_feedback(
    payload: CreateFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> FeedbackResponse:
    try:
        feedback = GuidanceFeedback(
            user_id=str(current_user.id),
            module=payload.module.strip().lower(),
            target_id=payload.target_id,
            child_id=payload.child_id,
            is_helpful=payload.is_helpful,
            rating=payload.rating,
            comment=payload.comment.strip() if payload.comment else None
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        logger.info(f"[Feedback] User {current_user.id} gave feedback on {payload.module}: helpful={payload.is_helpful}")
        return FeedbackResponse(
            id=feedback.id,
            module=feedback.module,
            is_helpful=feedback.is_helpful,
            message="Thank you! Your feedback helps us improve parenting guidance."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"[Feedback] Failed to submit feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not record feedback: {str(e)}"
        )
