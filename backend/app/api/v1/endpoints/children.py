from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.children_service import ChildrenService
from app.schemas.child_schemas import (
    ChildCreate,
    ChildUpdate,
    ChildResponse,
    ChildWithDetailsResponse,
    ChildProfileCreate,
    ChildProfileResponse,
    ParentingGoalCreate,
    ParentingGoalUpdate,
    ParentingGoalResponse,
)

router = APIRouter()


# ----------------------------------------------------
# Children Endpoints
# ----------------------------------------------------
@router.get(
    "",
    response_model=List[ChildResponse],
    status_code=status.HTTP_200_OK,
    summary="List all children for authenticated parent"
)
def get_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.get_children(db, user_id=current_user.id)


@router.post(
    "",
    response_model=ChildResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new child for authenticated parent"
)
def create_child(
    child_in: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.create_child(db, user_id=current_user.id, child_in=child_in)


@router.get(
    "/{child_id}",
    response_model=ChildWithDetailsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get child profile details, profile, and goals"
)
def get_child(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.get_child_details(db, child_id=child_id, user_id=current_user.id)


@router.put(
    "/{child_id}",
    response_model=ChildResponse,
    status_code=status.HTTP_200_OK,
    summary="Update child information"
)
def update_child(
    child_id: str,
    child_in: ChildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.update_child(
        db, child_id=child_id, user_id=current_user.id, child_in=child_in
    )


@router.delete(
    "/{child_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete child and associated profile & goals"
)
def delete_child(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.delete_child(db, child_id=child_id, user_id=current_user.id)


# ----------------------------------------------------
# Child Profile Endpoints
# ----------------------------------------------------
@router.get(
    "/{child_id}/profile",
    response_model=Optional[ChildProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get child profile observations"
)
def get_child_profile(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.get_profile(db, child_id=child_id, user_id=current_user.id)


@router.post(
    "/{child_id}/profile",
    response_model=ChildProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or update child profile observations"
)
def create_child_profile(
    child_id: str,
    profile_in: ChildProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.update_profile(
        db, child_id=child_id, user_id=current_user.id, profile_in=profile_in
    )


@router.put(
    "/{child_id}/profile",
    response_model=ChildProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update child profile observations"
)
def update_child_profile(
    child_id: str,
    profile_in: ChildProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.update_profile(
        db, child_id=child_id, user_id=current_user.id, profile_in=profile_in
    )


# ----------------------------------------------------
# Parenting Goals Endpoints
# ----------------------------------------------------
@router.get(
    "/{child_id}/goals",
    response_model=List[ParentingGoalResponse],
    status_code=status.HTTP_200_OK,
    summary="List parenting goals for child"
)
def get_parenting_goals(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.get_goals(db, child_id=child_id, user_id=current_user.id)


@router.post(
    "/{child_id}/goals",
    response_model=ParentingGoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a parenting goal for child"
)
def create_parenting_goal(
    child_id: str,
    goal_in: ParentingGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.create_goal(
        db, child_id=child_id, user_id=current_user.id, goal_in=goal_in
    )


@router.put(
    "/{child_id}/goals/{goal_id}",
    response_model=ParentingGoalResponse,
    status_code=status.HTTP_200_OK,
    summary="Update or deactivate a parenting goal"
)
def update_parenting_goal(
    child_id: str,
    goal_id: str,
    goal_in: ParentingGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.update_goal(
        db,
        child_id=child_id,
        goal_id=goal_id,
        user_id=current_user.id,
        goal_in=goal_in,
    )


@router.delete(
    "/{child_id}/goals/{goal_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a parenting goal"
)
def delete_parenting_goal(
    child_id: str,
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChildrenService.delete_goal(
        db, child_id=child_id, goal_id=goal_id, user_id=current_user.id
    )
