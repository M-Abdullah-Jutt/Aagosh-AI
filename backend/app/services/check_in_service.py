from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.child_repository import ChildRepository
from app.repositories.check_in_repository import CheckInRepository
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.schemas.check_in_schemas import (
    DailyCheckInCreate,
    DailyCheckInUpdate,
    DailyCheckInResponse,
    DailyCheckInWithEventsResponse,
    BehaviorEventCreate,
    BehaviorEventUpdate,
    BehaviorEventResponse,
)


class CheckInService:
    @staticmethod
    def _verify_child_owner(db: Session, child_id: str, user_id: str):
        child = ChildRepository.get_child_by_id(db, child_id=child_id, user_id=user_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found."
            )
        return child

    @staticmethod
    def _verify_check_in_owner(db: Session, child_id: str, check_in_id: str, user_id: str) -> DailyCheckIn:
        CheckInService._verify_child_owner(db, child_id=child_id, user_id=user_id)
        check_in = CheckInRepository.get_check_in_by_id(db, check_in_id=check_in_id, child_id=child_id)
        if not check_in:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Daily check-in not found."
            )
        return check_in

    @staticmethod
    def get_check_ins(db: Session, child_id: str, user_id: str) -> List[DailyCheckInResponse]:
        CheckInService._verify_child_owner(db, child_id=child_id, user_id=user_id)
        check_ins = CheckInRepository.get_check_ins_by_child(db, child_id=child_id)
        
        result = []
        for ci in check_ins:
            events_count = len(ci.behavior_events) if ci.behavior_events else 0
            resp = DailyCheckInResponse(
                id=ci.id,
                child_id=ci.child_id,
                check_in_date=ci.check_in_date,
                overall_mood=ci.overall_mood,
                general_notes=ci.general_notes,
                created_at=ci.created_at,
                updated_at=ci.updated_at,
                events_count=events_count,
            )
            result.append(resp)
        return result

    @staticmethod
    def create_check_in(
        db: Session, child_id: str, user_id: str, check_in_in: DailyCheckInCreate
    ) -> DailyCheckInWithEventsResponse:
        CheckInService._verify_child_owner(db, child_id=child_id, user_id=user_id)
        check_in = CheckInRepository.create_check_in(db, child_id=child_id, check_in_in=check_in_in)
        
        events_resp = [
            BehaviorEventResponse.model_validate(e) for e in (check_in.behavior_events or [])
        ]
        return DailyCheckInWithEventsResponse(
            id=check_in.id,
            child_id=check_in.child_id,
            check_in_date=check_in.check_in_date,
            overall_mood=check_in.overall_mood,
            general_notes=check_in.general_notes,
            created_at=check_in.created_at,
            updated_at=check_in.updated_at,
            events_count=len(events_resp),
            behavior_events=events_resp,
        )

    @staticmethod
    def get_check_in_details(
        db: Session, child_id: str, check_in_id: str, user_id: str
    ) -> DailyCheckInWithEventsResponse:
        check_in = CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        events_resp = [
            BehaviorEventResponse.model_validate(e) for e in (check_in.behavior_events or [])
        ]
        return DailyCheckInWithEventsResponse(
            id=check_in.id,
            child_id=check_in.child_id,
            check_in_date=check_in.check_in_date,
            overall_mood=check_in.overall_mood,
            general_notes=check_in.general_notes,
            created_at=check_in.created_at,
            updated_at=check_in.updated_at,
            events_count=len(events_resp),
            behavior_events=events_resp,
        )

    @staticmethod
    def update_check_in(
        db: Session,
        child_id: str,
        check_in_id: str,
        user_id: str,
        check_in_in: DailyCheckInUpdate,
    ) -> DailyCheckInResponse:
        check_in = CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        updated = CheckInRepository.update_check_in(db, check_in=check_in, check_in_in=check_in_in)
        events_count = len(updated.behavior_events) if updated.behavior_events else 0
        return DailyCheckInResponse(
            id=updated.id,
            child_id=updated.child_id,
            check_in_date=updated.check_in_date,
            overall_mood=updated.overall_mood,
            general_notes=updated.general_notes,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
            events_count=events_count,
        )

    @staticmethod
    def delete_check_in(
        db: Session, child_id: str, check_in_id: str, user_id: str
    ) -> dict:
        check_in = CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        CheckInRepository.delete_check_in(db, check_in=check_in)
        return {"message": "Daily check-in deleted successfully."}

    # ----------------------------------------------------
    # Behavior Event Services
    # ----------------------------------------------------
    @staticmethod
    def get_behavior_events(
        db: Session, child_id: str, check_in_id: str, user_id: str
    ) -> List[BehaviorEventResponse]:
        CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        events = CheckInRepository.get_behavior_events(db, check_in_id=check_in_id)
        return [BehaviorEventResponse.model_validate(e) for e in events]

    @staticmethod
    def create_behavior_event(
        db: Session,
        child_id: str,
        check_in_id: str,
        user_id: str,
        event_in: BehaviorEventCreate,
    ) -> BehaviorEventResponse:
        CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        event = CheckInRepository.create_behavior_event(
            db, check_in_id=check_in_id, event_in=event_in
        )
        return BehaviorEventResponse.model_validate(event)

    @staticmethod
    def get_behavior_event(
        db: Session, child_id: str, check_in_id: str, event_id: str, user_id: str
    ) -> BehaviorEventResponse:
        CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        event = CheckInRepository.get_behavior_event_by_id(
            db, event_id=event_id, check_in_id=check_in_id
        )
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Behavior event not found."
            )
        return BehaviorEventResponse.model_validate(event)

    @staticmethod
    def update_behavior_event(
        db: Session,
        child_id: str,
        check_in_id: str,
        event_id: str,
        user_id: str,
        event_in: BehaviorEventUpdate,
    ) -> BehaviorEventResponse:
        CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        event = CheckInRepository.get_behavior_event_by_id(
            db, event_id=event_id, check_in_id=check_in_id
        )
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Behavior event not found."
            )
        updated = CheckInRepository.update_behavior_event(db, event=event, event_in=event_in)
        return BehaviorEventResponse.model_validate(updated)

    @staticmethod
    def delete_behavior_event(
        db: Session, child_id: str, check_in_id: str, event_id: str, user_id: str
    ) -> dict:
        CheckInService._verify_check_in_owner(
            db, child_id=child_id, check_in_id=check_in_id, user_id=user_id
        )
        event = CheckInRepository.get_behavior_event_by_id(
            db, event_id=event_id, check_in_id=check_in_id
        )
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Behavior event not found."
            )
        CheckInRepository.delete_behavior_event(db, event=event)
        return {"message": "Behavior event deleted successfully."}
