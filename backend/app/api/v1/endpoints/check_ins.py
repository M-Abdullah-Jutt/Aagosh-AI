from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.check_in_service import CheckInService
from app.schemas.check_in_schemas import (
    DailyCheckInCreate,
    DailyCheckInUpdate,
    DailyCheckInResponse,
    DailyCheckInWithEventsResponse,
    BehaviorEventCreate,
    BehaviorEventUpdate,
    BehaviorEventResponse,
)

router = APIRouter()


# ----------------------------------------------------
# Daily Check-In Endpoints
# ----------------------------------------------------
@router.get(
    "",
    response_model=List[DailyCheckInResponse],
    status_code=status.HTTP_200_OK,
    summary="List historical daily check-ins for a child"
)
def get_check_ins(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.get_check_ins(db, child_id=child_id, user_id=current_user.id)


@router.post(
    "",
    response_model=DailyCheckInWithEventsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new daily check-in with optional behavior events"
)
def create_check_in(
    child_id: str,
    check_in_in: DailyCheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.create_check_in(
        db, child_id=child_id, user_id=current_user.id, check_in_in=check_in_in
    )


@router.get(
    "/{check_in_id}",
    response_model=DailyCheckInWithEventsResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve single check-in details and behavior events"
)
def get_check_in(
    child_id: str,
    check_in_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.get_check_in_details(
        db, child_id=child_id, check_in_id=check_in_id, user_id=current_user.id
    )


@router.put(
    "/{check_in_id}",
    response_model=DailyCheckInResponse,
    status_code=status.HTTP_200_OK,
    summary="Update daily check-in overall mood or general notes"
)
def update_check_in(
    child_id: str,
    check_in_id: str,
    check_in_in: DailyCheckInUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.update_check_in(
        db,
        child_id=child_id,
        check_in_id=check_in_id,
        user_id=current_user.id,
        check_in_in=check_in_in,
    )


@router.delete(
    "/{check_in_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a daily check-in and associated behavior events"
)
def delete_check_in(
    child_id: str,
    check_in_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.delete_check_in(
        db, child_id=child_id, check_in_id=check_in_id, user_id=current_user.id
    )


# ----------------------------------------------------
# Behavior Event Endpoints
# ----------------------------------------------------
@router.get(
    "/{check_in_id}/events",
    response_model=List[BehaviorEventResponse],
    status_code=status.HTTP_200_OK,
    summary="List behavior events for a specific check-in"
)
def get_behavior_events(
    child_id: str,
    check_in_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.get_behavior_events(
        db, child_id=child_id, check_in_id=check_in_id, user_id=current_user.id
    )


@router.post(
    "/{check_in_id}/events",
    response_model=BehaviorEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a behavior event to a daily check-in"
)
def create_behavior_event(
    child_id: str,
    check_in_id: str,
    event_in: BehaviorEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.create_behavior_event(
        db,
        child_id=child_id,
        check_in_id=check_in_id,
        user_id=current_user.id,
        event_in=event_in,
    )


@router.get(
    "/{check_in_id}/events/{event_id}",
    response_model=BehaviorEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve single behavior event"
)
def get_behavior_event(
    child_id: str,
    check_in_id: str,
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.get_behavior_event(
        db,
        child_id=child_id,
        check_in_id=check_in_id,
        event_id=event_id,
        user_id=current_user.id,
    )


@router.put(
    "/{check_in_id}/events/{event_id}",
    response_model=BehaviorEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a behavior event"
)
def update_behavior_event(
    child_id: str,
    check_in_id: str,
    event_id: str,
    event_in: BehaviorEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.update_behavior_event(
        db,
        child_id=child_id,
        check_in_id=check_in_id,
        event_id=event_id,
        user_id=current_user.id,
        event_in=event_in,
    )


@router.delete(
    "/{check_in_id}/events/{event_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a behavior event"
)
def delete_behavior_event(
    child_id: str,
    check_in_id: str,
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return CheckInService.delete_behavior_event(
        db,
        child_id=child_id,
        check_in_id=check_in_id,
        event_id=event_id,
        user_id=current_user.id,
    )
