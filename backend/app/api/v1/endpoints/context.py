from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.context_assembly_service import ContextAssemblyService
from app.schemas.context_schemas import ContextAssemblyRequest, AssembledContextResponse

router = APIRouter()


@router.post(
    "",
    response_model=AssembledContextResponse,
    status_code=status.HTTP_200_OK,
    summary="Assemble structured, read-only context for a child (Development / Future LLM Ingestion)"
)
def build_context(
    child_id: str,
    request: ContextAssemblyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assembles structured, read-only context payload combining factual child info,
    profile, active goals, recent check-ins/events, deterministic analytics, and age-aware retrieved knowledge.
    Enforces strict ownership security (User -> Child -> Context).
    Does NOT invoke LLMs or generate advice.
    """
    return ContextAssemblyService.build_context(
        db=db,
        child_id=child_id,
        user_id=current_user.id,
        query=request.query,
        period=request.period,
        max_check_ins=request.max_check_ins,
        max_events=request.max_events,
        top_k_knowledge=request.top_k_knowledge
    )
