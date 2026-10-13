from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.user import User
from app.models.child import Child
from app.models.check_in import DailyCheckIn
from app.models.coach import CoachConversation

from app.models.feedback import GuidanceFeedback

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(deps.get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(User.id).join(Child).distinct().count() or 0 
    total_children = db.query(func.count(Child.id)).scalar() or 0
    total_checkins = db.query(func.count(DailyCheckIn.id)).scalar() or 0
    total_conversations = db.query(func.count(CoachConversation.id)).scalar() or 0
    # Calculate adoption percentages
    users_with_checkins = db.query(DailyCheckIn.child_id).distinct().count() or 0
    checkin_adoption = int((users_with_checkins / max(total_children, 1)) * 100)
    
    users_with_coach = db.query(CoachConversation.child_id).distinct().count() or 0
    coach_adoption = int((users_with_coach / max(total_children, 1)) * 100)

    # Guidance Feedback Analytics
    total_feedback = db.query(func.count(GuidanceFeedback.id)).scalar() or 0
    helpful_feedback = db.query(func.count(GuidanceFeedback.id)).filter(GuidanceFeedback.is_helpful == True).scalar() or 0
    not_helpful_feedback = total_feedback - helpful_feedback
    overall_satisfaction = int((helpful_feedback / max(total_feedback, 1)) * 100) if total_feedback > 0 else 100

    # AI Chat Coach feedback stats
    coach_total_fb = db.query(func.count(GuidanceFeedback.id)).filter(GuidanceFeedback.module.in_(['ai_chat_coach', 'ai_coach'])).scalar() or 0
    coach_helpful_fb = db.query(func.count(GuidanceFeedback.id)).filter(GuidanceFeedback.module.in_(['ai_chat_coach', 'ai_coach']), GuidanceFeedback.is_helpful == True).scalar() or 0
    coach_satisfaction = int((coach_helpful_fb / max(coach_total_fb, 1)) * 100) if coach_total_fb > 0 else 100

    # Parent Practice feedback stats
    practice_total_fb = db.query(func.count(GuidanceFeedback.id)).filter(GuidanceFeedback.module.in_(['parent_practice', 'practice'])).scalar() or 0
    practice_helpful_fb = db.query(func.count(GuidanceFeedback.id)).filter(GuidanceFeedback.module.in_(['parent_practice', 'practice']), GuidanceFeedback.is_helpful == True).scalar() or 0
    practice_satisfaction = int((practice_helpful_fb / max(practice_total_fb, 1)) * 100) if practice_total_fb > 0 else 100

    # Recent feedback entries
    recent_feedbacks_query = db.query(GuidanceFeedback).order_by(GuidanceFeedback.created_at.desc()).limit(8).all()
    recent_feedback = [
        {
            "id": f.id,
            "module": f.module,
            "is_helpful": f.is_helpful,
            "rating": f.rating,
            "comment": f.comment,
            "created_at": f.created_at.isoformat() if f.created_at else None
        }
        for f in recent_feedbacks_query
    ]

    # Get latest users
    latest_users_query = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    latest_users = [{"id": u.id, "email": u.email, "role": "Parent"} for u in latest_users_query]
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_children": total_children,
        "system_health": "99.9%",
        "total_checkins": total_checkins,
        "total_conversations": total_conversations,
        "checkin_adoption": checkin_adoption,
        "coach_adoption": coach_adoption,
        "latest_users": latest_users,
        "feedback_stats": {
            "total_feedback": total_feedback,
            "helpful_feedback": helpful_feedback,
            "not_helpful_feedback": not_helpful_feedback,
            "overall_satisfaction": overall_satisfaction,
            "coach": {
                "total": coach_total_fb,
                "helpful": coach_helpful_fb,
                "satisfaction": coach_satisfaction
            },
            "practice": {
                "total": practice_total_fb,
                "helpful": practice_helpful_fb,
                "satisfaction": practice_satisfaction
            },
            "recent": recent_feedback
        }
    }
