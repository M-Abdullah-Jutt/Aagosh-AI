from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.child_repository import ChildRepository
from app.models.child import Child, ChildProfile, ParentingGoal
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
from app.utils.date_utils import calculate_age


class ChildrenService:
    @staticmethod
    def _enrich_child_response(child: Child) -> ChildResponse:
        """
        Enrich a Child model with computed age_display and active_goals_count fields.
        """
        active_goals_count = (
            sum(1 for g in child.goals if g.is_active) if child.goals else 0
        )
        age_display = calculate_age(child.date_of_birth)
        
        return ChildResponse(
            id=child.id,
            user_id=child.user_id,
            first_name=child.first_name,
            date_of_birth=child.date_of_birth,
            gender=child.gender,
            created_at=child.created_at,
            updated_at=child.updated_at,
            age_display=age_display,
            active_goals_count=active_goals_count,
        )

    @staticmethod
    def get_children(db: Session, user_id: str) -> List[ChildResponse]:
        children = ChildRepository.get_children_by_parent(db, user_id=user_id)
        return [ChildrenService._enrich_child_response(c) for c in children]

    @staticmethod
    def create_child(db: Session, user_id: str, child_in: ChildCreate) -> ChildResponse:
        child = ChildRepository.create_child(db, user_id=user_id, child_in=child_in)
        return ChildrenService._enrich_child_response(child)

    @staticmethod
    def get_child_details(db: Session, child_id: str, user_id: str) -> ChildWithDetailsResponse:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )

        active_goals_count = sum(1 for g in child.goals if g.is_active) if child.goals else 0
        age_display = calculate_age(child.date_of_birth)

        profile_resp = (
            ChildProfileResponse.model_validate(child.profile)
            if child.profile
            else None
        )
        goals_resp = [
            ParentingGoalResponse.model_validate(g) for g in (child.goals or [])
        ]

        return ChildWithDetailsResponse(
            id=child.id,
            user_id=child.user_id,
            first_name=child.first_name,
            date_of_birth=child.date_of_birth,
            gender=child.gender,
            created_at=child.created_at,
            updated_at=child.updated_at,
            age_display=age_display,
            active_goals_count=active_goals_count,
            profile=profile_resp,
            goals=goals_resp,
        )

    @staticmethod
    def update_child(
        db: Session, child_id: str, user_id: str, child_in: ChildUpdate
    ) -> ChildResponse:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        updated_child = ChildRepository.update_child(db, child=child, child_in=child_in)
        return ChildrenService._enrich_child_response(updated_child)

    @staticmethod
    def delete_child(db: Session, child_id: str, user_id: str) -> dict:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        ChildRepository.delete_child(db, child=child)
        return {"message": "Child profile deleted successfully."}

    # ----------------------------------------------------
    # Profile Services
    # ----------------------------------------------------
    @staticmethod
    def get_profile(
        db: Session, child_id: str, user_id: str
    ) -> Optional[ChildProfileResponse]:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        if not child.profile:
            return None
        return ChildProfileResponse.model_validate(child.profile)

    @staticmethod
    def update_profile(
        db: Session, child_id: str, user_id: str, profile_in: ChildProfileCreate
    ) -> ChildProfileResponse:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        profile = ChildRepository.create_or_update_profile(
            db, child_id=child_id, profile_in=profile_in
        )
        return ChildProfileResponse.model_validate(profile)

    # ----------------------------------------------------
    # Goals Services
    # ----------------------------------------------------
    @staticmethod
    def get_goals(
        db: Session, child_id: str, user_id: str
    ) -> List[ParentingGoalResponse]:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        goals = ChildRepository.get_goals(db, child_id=child_id)
        return [ParentingGoalResponse.model_validate(g) for g in goals]

    @staticmethod
    def create_goal(
        db: Session, child_id: str, user_id: str, goal_in: ParentingGoalCreate
    ) -> ParentingGoalResponse:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        goal = ChildRepository.create_goal(db, child_id=child_id, goal_in=goal_in)
        return ParentingGoalResponse.model_validate(goal)

    @staticmethod
    def update_goal(
        db: Session,
        child_id: str,
        goal_id: str,
        user_id: str,
        goal_in: ParentingGoalUpdate,
    ) -> ParentingGoalResponse:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        goal = ChildRepository.get_goal_by_id(db, goal_id=goal_id, child_id=child_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parenting goal not found."
            )
        updated_goal = ChildRepository.update_goal(db, goal=goal, goal_in=goal_in)
        return ParentingGoalResponse.model_validate(updated_goal)

    @staticmethod
    def delete_goal(
        db: Session, child_id: str, goal_id: str, user_id: str
    ) -> dict:
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        goal = ChildRepository.get_goal_by_id(db, goal_id=goal_id, child_id=child_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parenting goal not found."
            )
        ChildRepository.delete_goal(db, goal=goal)
        return {"message": "Parenting goal deleted successfully."}
