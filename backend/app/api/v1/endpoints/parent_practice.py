import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.parent_practice_schemas import (
    ScenarioItem,
    PracticeTurnRequest,
    PracticeTurnResponse,
    PracticeDebriefRequest,
    PracticeDebriefResponse
)
from app.services.parent_practice_service import parent_practice_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/scenarios",
    response_model=List[ScenarioItem],
    status_code=status.HTTP_200_OK,
    summary="List all parenting practice scenarios",
    description="Returns curated child behavior practice scenarios across different age groups and challenge types."
)
def get_scenarios(
    current_user: User = Depends(get_current_user)
) -> List[ScenarioItem]:
    return parent_practice_service.get_all_scenarios()


@router.post(
    "/turn",
    response_model=PracticeTurnResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate next turn with the virtual child",
    description="Parent sends how they responded to the child. The AI simulates the child's natural psychological reaction and provides coach whisper feedback."
)
def simulate_practice_turn(
    payload: PracticeTurnRequest,
    current_user: User = Depends(get_current_user)
) -> PracticeTurnResponse:
    return parent_practice_service.simulate_child_turn(payload)


@router.post(
    "/debrief",
    response_model=PracticeDebriefResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate comprehensive AI coach debrief for the practice session",
    description="Analyzes the entire session, highlights wrong parent behaviors, mistakes, what was done well, and provides key recommendations."
)
def generate_practice_debrief(
    payload: PracticeDebriefRequest,
    current_user: User = Depends(get_current_user)
) -> PracticeDebriefResponse:
    return parent_practice_service.generate_debrief(payload)
