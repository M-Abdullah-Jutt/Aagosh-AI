from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.child import Child, ChildProfile, ParentingGoal
from app.schemas.child_schemas import (
    ChildCreate,
    ChildUpdate,
    ChildProfileCreate,
    ChildProfileUpdate,
    ParentingGoalCreate,
    ParentingGoalUpdate,
)


class ChildRepository:
    @staticmethod
    def get_children_by_parent(db: Session, user_id: str) -> List[Child]:
        """
        Query all children belonging to a specific parent user.
        """
        return (
            db.query(Child)
            .filter(Child.user_id == user_id)
            .order_by(Child.first_name.asc())
            .all()
        )

    @staticmethod
    def get_child_by_id(db: Session, child_id: str, user_id: str) -> Optional[Child]:
        """
        Query a single child by primary key ID and verify parent ownership.
        """
        return (
            db.query(Child)
            .filter(Child.id == child_id, Child.user_id == user_id)
            .first()
        )

    @staticmethod
    def create_child(db: Session, user_id: str, child_in: ChildCreate) -> Child:
        """
        Create a new child record, optional profile, and initial goals.
        """
        child = Child(
            user_id=user_id,
            first_name=child_in.first_name,
            date_of_birth=child_in.date_of_birth,
            gender=child_in.gender,
        )
        db.add(child)
        db.flush()

        # Optional initial profile
        if child_in.profile:
            profile = ChildProfile(
                child_id=child.id,
                strengths=child_in.profile.strengths,
                challenges=child_in.profile.challenges,
                personality_notes=child_in.profile.personality_notes,
                communication_style=child_in.profile.communication_style,
            )
            db.add(profile)

        # Optional initial goals
        if child_in.goals:
            for goal_item in child_in.goals:
                goal = ParentingGoal(
                    child_id=child.id,
                    goal_type=goal_item.goal_type,
                    description=goal_item.description,
                    priority=goal_item.priority,
                    is_active=True,
                )
                db.add(goal)

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def update_child(db: Session, child: Child, child_in: ChildUpdate) -> Child:
        """
        Update basic information of an existing child record.
        """
        if child_in.first_name is not None:
            child.first_name = child_in.first_name
        if child_in.date_of_birth is not None:
            child.date_of_birth = child_in.date_of_birth
        if child_in.gender is not None:
            child.gender = child_in.gender

        db.commit()
        db.refresh(child)
        return child

    @staticmethod
    def delete_child(db: Session, child: Child) -> None:
        """
        Delete a child record (cascading profile and goals).
        """
        db.delete(child)
        db.commit()

    # ----------------------------------------------------
    # Child Profile Methods
    # ----------------------------------------------------
    @staticmethod
    def get_profile(db: Session, child_id: str) -> Optional[ChildProfile]:
        return db.query(ChildProfile).filter(ChildProfile.child_id == child_id).first()

    @staticmethod
    def create_or_update_profile(
        db: Session, child_id: str, profile_in: ChildProfileCreate
    ) -> ChildProfile:
        profile = ChildRepository.get_profile(db, child_id)
        if profile:
            if profile_in.strengths is not None:
                profile.strengths = profile_in.strengths
            if profile_in.challenges is not None:
                profile.challenges = profile_in.challenges
            if profile_in.personality_notes is not None:
                profile.personality_notes = profile_in.personality_notes
            if profile_in.communication_style is not None:
                profile.communication_style = profile_in.communication_style
        else:
            profile = ChildProfile(
                child_id=child_id,
                strengths=profile_in.strengths,
                challenges=profile_in.challenges,
                personality_notes=profile_in.personality_notes,
                communication_style=profile_in.communication_style,
            )
            db.add(profile)

        db.commit()
        db.refresh(profile)
        return profile

    # ----------------------------------------------------
    # Parenting Goals Methods
    # ----------------------------------------------------
    @staticmethod
    def get_goals(db: Session, child_id: str) -> List[ParentingGoal]:
        return (
            db.query(ParentingGoal)
            .filter(ParentingGoal.child_id == child_id)
            .order_by(ParentingGoal.created_at.desc())
            .all()
        )

    @staticmethod
    def get_goal_by_id(db: Session, goal_id: str, child_id: str) -> Optional[ParentingGoal]:
        return (
            db.query(ParentingGoal)
            .filter(ParentingGoal.id == goal_id, ParentingGoal.child_id == child_id)
            .first()
        )

    @staticmethod
    def create_goal(
        db: Session, child_id: str, goal_in: ParentingGoalCreate
    ) -> ParentingGoal:
        goal = ParentingGoal(
            child_id=child_id,
            goal_type=goal_in.goal_type,
            description=goal_in.description,
            priority=goal_in.priority,
            is_active=True,
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def update_goal(
        db: Session, goal: ParentingGoal, goal_in: ParentingGoalUpdate
    ) -> ParentingGoal:
        if goal_in.goal_type is not None:
            goal.goal_type = goal_in.goal_type
        if goal_in.description is not None:
            goal.description = goal_in.description
        if goal_in.priority is not None:
            goal.priority = goal_in.priority
        if goal_in.is_active is not None:
            goal.is_active = goal_in.is_active

        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def delete_goal(db: Session, goal: ParentingGoal) -> None:
        db.delete(goal)
        db.commit()
