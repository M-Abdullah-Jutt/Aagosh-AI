import os
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session

from app.utils.date_utils import calculate_age
from app.services.check_in_service import CheckInService
from app.services.analytics_service import AnalyticsService
from app.knowledge.retrieval import KnowledgeRetrievalService
from app.repositories.context_repository import ContextRepository
from app.schemas.context_schemas import (
    AssembledContextResponse,
    ContextChildInfo,
    ContextProfileInfo,
    ContextGoalInfo,
    ContextCheckInInfo,
    ContextBehaviorEventInfo,
    ContextRecentObservations,
    ContextMetadata,
)


class ContextAssemblyService:
    @staticmethod
    def build_context(
        db: Session,
        child_id: str,
        user_id: str,
        query: str,
        period: str = "30d",
        max_check_ins: Optional[int] = None,
        max_events: Optional[int] = None,
        top_k_knowledge: Optional[int] = None,
        today: Optional[date] = None
    ) -> AssembledContextResponse:
        """
        Assembles a read-only, structured context object combining factual child data,
        profile observations, active goals, recent check-ins/events, deterministic analytics,
        and age-aware RAG knowledge retrieval.
        Enforces strict ownership security (User -> Child -> Context).
        Zero LLM calls or advice generation.
        """
        # 1. Budget & Configuration Limits
        limit_check_ins = max_check_ins if max_check_ins is not None else int(os.getenv("MAX_RECENT_CHECK_INS", "5"))
        limit_events = max_events if max_events is not None else int(os.getenv("MAX_RECENT_BEHAVIOR_EVENTS", "10"))
        limit_top_k = top_k_knowledge if top_k_knowledge is not None else int(os.getenv("TOP_K_KNOWLEDGE_RESULTS", "5"))

        # 2. Ownership Verification & Child Loading
        child = CheckInService._verify_child_owner(db, child_id=child_id, user_id=user_id)

        # 3. Numerical Age Calculation
        if today is None:
            today = date.today()
        dob = child.date_of_birth
        years = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        months = (today.month - dob.month - (today.day < dob.day)) % 12
        age_display = calculate_age(dob, today=today)

        child_info = ContextChildInfo(
            id=child.id,
            first_name=child.first_name,
            date_of_birth=child.date_of_birth,
            gender=child.gender,
            age_years=years,
            age_months=months,
            age_display=age_display,
        )

        # 4. Child Profile (Non-clinical parent observations)
        profile_info = None
        if child.profile:
            profile_info = ContextProfileInfo(
                strengths=child.profile.strengths,
                challenges=child.profile.challenges,
                personality_notes=child.profile.personality_notes,
                communication_style=child.profile.communication_style,
            )

        # 5. Active Parenting Goals
        goals_info = []
        if child.goals:
            active_goals = [g for g in child.goals if g.is_active]
            for g in active_goals:
                goals_info.append(
                    ContextGoalInfo(
                        id=g.id,
                        goal_type=g.goal_type,
                        description=g.description,
                        priority=g.priority,
                        is_active=g.is_active,
                    )
                )

        # 6. Recent Check-Ins & Behavior Events
        check_ins_db = ContextRepository.get_recent_check_ins(db, child_id=child_id, limit=limit_check_ins)
        events_db = ContextRepository.get_recent_behavior_events(db, child_id=child_id, limit=limit_events)

        check_ins_info = [
            ContextCheckInInfo(
                id=ci.id,
                check_in_date=ci.check_in_date,
                overall_mood=ci.overall_mood,
                general_notes=ci.general_notes,
            )
            for ci in check_ins_db
        ]

        events_info = [
            ContextBehaviorEventInfo(
                id=e.id,
                check_in_id=e.check_in_id,
                event_date=e.check_in.check_in_date if e.check_in else None,
                emotion=e.emotion,
                intensity=e.intensity,
                trigger=e.trigger,
                behavior_description=e.behavior_description,
                parent_response=e.parent_response,
                outcome=e.outcome,
            )
            for e in events_db
        ]

        recent_obs = ContextRecentObservations(
            check_ins=check_ins_info,
            behavior_events=events_info,
        )

        # 7. Reuse Step 6 Deterministic Analytics
        analytics_summary = AnalyticsService.get_analytics_summary(
            db=db,
            child_id=child_id,
            user_id=user_id,
            period=period,
            today=today
        )

        # 8. Age-Aware Step 7 Knowledge Retrieval (with fallback)
        knowledge_results = KnowledgeRetrievalService.retrieve(
            query=query,
            filters={"age": years},
            top_k=limit_top_k
        )
        if not knowledge_results:
            knowledge_results = KnowledgeRetrievalService.retrieve(
                query=query,
                filters=None,
                top_k=limit_top_k
            )

        # 9. Assembled Metadata & Output Payload
        metadata_info = ContextMetadata(
            query=query,
            analytics_period=period,
            generated_at=datetime.utcnow(),
            knowledge_results_count=len(knowledge_results),
            limits={
                "max_check_ins": limit_check_ins,
                "max_events": limit_events,
                "top_k_knowledge": limit_top_k,
            }
        )

        return AssembledContextResponse(
            child=child_info,
            profile=profile_info,
            parenting_goals=goals_info,
            recent_observations=recent_obs,
            analytics=analytics_summary,
            retrieved_knowledge=knowledge_results,
            metadata=metadata_info,
        )
