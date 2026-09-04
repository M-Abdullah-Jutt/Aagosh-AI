from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models.check_in import DailyCheckIn, BehaviorEvent


class ContextRepository:
    @staticmethod
    def get_recent_check_ins(db: Session, child_id: str, limit: int = 5) -> List[DailyCheckIn]:
        return (
            db.query(DailyCheckIn)
            .filter(DailyCheckIn.child_id == child_id)
            .order_by(DailyCheckIn.check_in_date.desc(), DailyCheckIn.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_recent_behavior_events(db: Session, child_id: str, limit: int = 10) -> List[BehaviorEvent]:
        return (
            db.query(BehaviorEvent)
            .options(joinedload(BehaviorEvent.check_in))
            .join(DailyCheckIn, BehaviorEvent.check_in_id == DailyCheckIn.id)
            .filter(DailyCheckIn.child_id == child_id)
            .order_by(DailyCheckIn.check_in_date.desc(), BehaviorEvent.created_at.desc())
            .limit(limit)
            .all()
        )
