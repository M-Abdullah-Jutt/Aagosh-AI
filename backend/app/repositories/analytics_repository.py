from datetime import date
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.models.child import ParentingGoal


class AnalyticsRepository:
    @staticmethod
    def get_check_ins_count(
        db: Session,
        child_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        query = db.query(func.count(DailyCheckIn.id)).filter(DailyCheckIn.child_id == child_id)
        if start_date:
            query = query.filter(DailyCheckIn.check_in_date >= start_date)
        if end_date:
            query = query.filter(DailyCheckIn.check_in_date <= end_date)
        return query.scalar() or 0

    @staticmethod
    def get_behavior_events(
        db: Session,
        child_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[BehaviorEvent]:
        query = (
            db.query(BehaviorEvent)
            .options(joinedload(BehaviorEvent.check_in))
            .join(DailyCheckIn, BehaviorEvent.check_in_id == DailyCheckIn.id)
            .filter(DailyCheckIn.child_id == child_id)
        )
        if start_date:
            query = query.filter(DailyCheckIn.check_in_date >= start_date)
        if end_date:
            query = query.filter(DailyCheckIn.check_in_date <= end_date)
        
        # Order by check_in_date ascending, then created_at ascending
        query = query.order_by(DailyCheckIn.check_in_date.asc(), BehaviorEvent.created_at.asc())
        return query.all()


    @staticmethod
    def get_active_goals(db: Session, child_id: str) -> List[ParentingGoal]:
        return (
            db.query(ParentingGoal)
            .filter(
                ParentingGoal.child_id == child_id,
                ParentingGoal.is_active == True
            )
            .all()
        )
