from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.schemas.check_in_schemas import (
    DailyCheckInCreate,
    DailyCheckInUpdate,
    BehaviorEventCreate,
    BehaviorEventUpdate,
)


class CheckInRepository:
    @staticmethod
    def get_check_ins_by_child(db: Session, child_id: str) -> List[DailyCheckIn]:
        """
        Query all daily check-ins for a given child, ordered by check_in_date descending.
        """
        return (
            db.query(DailyCheckIn)
            .filter(DailyCheckIn.child_id == child_id)
            .order_by(DailyCheckIn.check_in_date.desc(), DailyCheckIn.created_at.desc())
            .all()
        )

    @staticmethod
    def get_check_in_by_id(
        db: Session, check_in_id: str, child_id: str
    ) -> Optional[DailyCheckIn]:
        """
        Query a single daily check-in by primary key ID and child_id.
        """
        return (
            db.query(DailyCheckIn)
            .filter(DailyCheckIn.id == check_in_id, DailyCheckIn.child_id == child_id)
            .first()
        )

    @staticmethod
    def create_check_in(
        db: Session, child_id: str, check_in_in: DailyCheckInCreate
    ) -> DailyCheckIn:
        """
        Create a new daily check-in record and optional initial behavior events.
        """
        check_in = DailyCheckIn(
            child_id=child_id,
            check_in_date=check_in_in.check_in_date,
            overall_mood=check_in_in.overall_mood,
            general_notes=check_in_in.general_notes,
        )
        db.add(check_in)
        db.flush()

        if check_in_in.events:
            for event_item in check_in_in.events:
                event = BehaviorEvent(
                    check_in_id=check_in.id,
                    emotion=event_item.emotion,
                    intensity=event_item.intensity,
                    trigger=event_item.trigger,
                    behavior_description=event_item.behavior_description,
                    parent_response=event_item.parent_response,
                    outcome=event_item.outcome,
                    event_notes=event_item.event_notes,
                )
                db.add(event)

        db.commit()
        db.refresh(check_in)
        return check_in

    @staticmethod
    def update_check_in(
        db: Session, check_in: DailyCheckIn, check_in_in: DailyCheckInUpdate
    ) -> DailyCheckIn:
        """
        Update an existing daily check-in record.
        """
        if check_in_in.check_in_date is not None:
            check_in.check_in_date = check_in_in.check_in_date
        if check_in_in.overall_mood is not None:
            check_in.overall_mood = check_in_in.overall_mood
        if check_in_in.general_notes is not None:
            check_in.general_notes = check_in_in.general_notes

        db.commit()
        db.refresh(check_in)
        return check_in

    @staticmethod
    def delete_check_in(db: Session, check_in: DailyCheckIn) -> None:
        """
        Delete a daily check-in (cascading associated behavior events).
        """
        db.delete(check_in)
        db.commit()

    # ----------------------------------------------------
    # Behavior Event Methods
    # ----------------------------------------------------
    @staticmethod
    def get_behavior_events(db: Session, check_in_id: str) -> List[BehaviorEvent]:
        return (
            db.query(BehaviorEvent)
            .filter(BehaviorEvent.check_in_id == check_in_id)
            .order_by(BehaviorEvent.created_at.asc())
            .all()
        )

    @staticmethod
    def get_behavior_event_by_id(
        db: Session, event_id: str, check_in_id: str
    ) -> Optional[BehaviorEvent]:
        return (
            db.query(BehaviorEvent)
            .filter(BehaviorEvent.id == event_id, BehaviorEvent.check_in_id == check_in_id)
            .first()
        )

    @staticmethod
    def create_behavior_event(
        db: Session, check_in_id: str, event_in: BehaviorEventCreate
    ) -> BehaviorEvent:
        event = BehaviorEvent(
            check_in_id=check_in_id,
            emotion=event_in.emotion,
            intensity=event_in.intensity,
            trigger=event_in.trigger,
            behavior_description=event_in.behavior_description,
            parent_response=event_in.parent_response,
            outcome=event_in.outcome,
            event_notes=event_in.event_notes,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def update_behavior_event(
        db: Session, event: BehaviorEvent, event_in: BehaviorEventUpdate
    ) -> BehaviorEvent:
        if event_in.emotion is not None:
            event.emotion = event_in.emotion
        if event_in.intensity is not None:
            event.intensity = event_in.intensity
        if event_in.trigger is not None:
            event.trigger = event_in.trigger
        if event_in.behavior_description is not None:
            event.behavior_description = event_in.behavior_description
        if event_in.parent_response is not None:
            event.parent_response = event_in.parent_response
        if event_in.outcome is not None:
            event.outcome = event_in.outcome
        if event_in.event_notes is not None:
            event.event_notes = event_in.event_notes

        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def delete_behavior_event(db: Session, event: BehaviorEvent) -> None:
        db.delete(event)
        db.commit()
