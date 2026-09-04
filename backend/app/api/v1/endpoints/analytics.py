from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics_schemas import AnalyticsSummaryResponse

router = APIRouter()


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get deterministic behavior analytics summary for a child"
)
def get_analytics_summary(
    child_id: str,
    period: str = Query("7d", pattern="^(7d|14d|30d|all)$", description="Data window: 7d, 14d, 30d, all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns deterministic, explainable behavioral statistics for a parent's child.
    Enforces strict ownership security (User -> Child -> Analytics).
    Does NOT invoke AI or modify any raw database records.
    """
    return AnalyticsService.get_analytics_summary(
        db=db,
        child_id=child_id,
        user_id=current_user.id,
        period=period
    )
