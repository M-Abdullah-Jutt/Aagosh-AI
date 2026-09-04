from datetime import date, timedelta
from typing import Dict, List, Optional
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session

from app.services.check_in_service import CheckInService
from app.repositories.analytics_repository import AnalyticsRepository
from app.utils.date_utils import get_date_window
from app.schemas.analytics_schemas import (
    AnalyticsSummaryResponse,
    PeriodInfo,
    DataSufficiency,
    CountStat,
    EmotionAnalytics,
    TriggerAnalytics,
    IntensityAnalytics,
    FrequencyBreakdown,
    RecentActivity,
    TrendAnalytics,
    FrequentContext,
    GoalAlignment,
)


def round_half_up(val: float, decimals: int = 1) -> float:
    """
    Standard mathematical rounding (half-up) to specified decimal places.
    Prevents banker's rounding discrepancies (e.g. 3.25 -> 3.3).
    """
    d = Decimal(str(val))
    return float(d.quantize(Decimal('1.' + '0' * decimals if decimals > 0 else '1'), rounding=ROUND_HALF_UP))


class AnalyticsService:
    @staticmethod
    def get_analytics_summary(
        db: Session,
        child_id: str,
        user_id: str,
        period: str = "7d",
        today: Optional[date] = None
    ) -> AnalyticsSummaryResponse:
        # 1. Verify child ownership
        CheckInService._verify_child_owner(db, child_id=child_id, user_id=user_id)

        # 2. Get date window
        start_date, end_date, prev_start_date, prev_end_date = get_date_window(period=period, today=today)

        # 3. Retrieve DB records (Immutability preserved)
        events = AnalyticsRepository.get_behavior_events(db, child_id=child_id, start_date=start_date, end_date=end_date)
        total_check_ins = AnalyticsRepository.get_check_ins_count(db, child_id=child_id, start_date=start_date, end_date=end_date)
        total_events = len(events)

        # 4. Data Sufficiency
        if total_events <= 2:
            sufficiency_level = "insufficient_data"
            sufficiency_msg = "Not enough observations yet. Continue recording daily check-ins and behavior events to build a clearer picture over time."
        elif total_events <= 6:
            sufficiency_level = "early_observations"
            sufficiency_msg = "Continue recording observations to build a clearer picture over time."
        else:
            sufficiency_level = "basic_pattern_analysis"
            sufficiency_msg = "Sufficient data collected for basic pattern analysis."

        data_sufficiency = DataSufficiency(
            level=sufficiency_level,
            event_count=total_events,
            message=sufficiency_msg,
        )

        # 5. Emotion Analytics
        emotion_counter = Counter(e.emotion for e in events if e.emotion)
        emotion_freqs = dict(sorted(emotion_counter.items(), key=lambda x: x[1], reverse=True))
        most_observed_emotion = next(iter(emotion_freqs.keys()), None) if emotion_freqs else None

        emotions_stat = EmotionAnalytics(
            frequencies=emotion_freqs,
            most_observed=most_observed_emotion,
            label="Most frequently observed emotion"
        )

        # 6. Trigger Analytics
        trigger_counter = Counter(e.trigger for e in events if e.trigger)
        trigger_freqs = dict(sorted(trigger_counter.items(), key=lambda x: x[1], reverse=True))
        most_observed_trigger = next(iter(trigger_freqs.keys()), None) if trigger_freqs else None

        trigger_percentages = {}
        if total_events > 0:
            for trig, count in trigger_freqs.items():
                trigger_percentages[trig] = round_half_up((count / total_events) * 100, 1)

        triggers_stat = TriggerAnalytics(
            frequencies=trigger_freqs,
            percentages=trigger_percentages,
            most_observed=most_observed_trigger,
            label="Most frequently observed trigger"
        )

        # 7. Intensity Analytics
        intensity_dist = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        if total_events > 0:
            intensities = [e.intensity for e in events]
            avg_intensity = round_half_up(sum(intensities) / total_events, 1)
            min_intensity = min(intensities)
            max_intensity = max(intensities)
            for val in intensities:
                key = str(val)
                if key in intensity_dist:
                    intensity_dist[key] += 1
        else:
            avg_intensity = 0.0
            min_intensity = 0
            max_intensity = 0

        intensity_stat = IntensityAnalytics(
            average=avg_intensity,
            minimum=min_intensity,
            maximum=max_intensity,
            distribution=intensity_dist,
            label="Observed intensity"
        )

        # 8. Parent Response Analytics
        response_counter = Counter(e.parent_response for e in events if e.parent_response)
        parent_responses_stat = FrequencyBreakdown(
            frequencies=dict(sorted(response_counter.items(), key=lambda x: x[1], reverse=True))
        )

        # 9. Outcome Analytics
        outcome_counter = Counter(e.outcome for e in events if e.outcome)
        outcomes_stat = FrequencyBreakdown(
            frequencies=dict(sorted(outcome_counter.items(), key=lambda x: x[1], reverse=True))
        )

        # 10. Recent Activity
        if period != "all":
            prev_events = AnalyticsRepository.get_behavior_events(
                db, child_id=child_id, start_date=prev_start_date, end_date=prev_end_date
            )
            prev_count = len(prev_events)
            change_count = total_events - prev_count
            if prev_count > 0:
                change_pct = round_half_up(((total_events - prev_count) / prev_count) * 100, 1)

            else:
                change_pct = None

            if change_count > 0:
                recent_msg = "More events were recorded in this period than in the previous equivalent period."
            elif change_count < 0:
                recent_msg = "Fewer events were recorded in this period than in the previous equivalent period."
            else:
                recent_msg = "Same number of events were recorded as in the previous equivalent period."
        else:
            prev_count = None
            change_count = None
            change_pct = None
            recent_msg = "All-time observation summary."

        recent_activity_stat = RecentActivity(
            current_period_events=total_events,
            previous_period_events=prev_count,
            change_count=change_count,
            change_percentage=change_pct,
            summary_message=recent_msg,
        )

        # 11. Trend Analytics (Deterministic)
        if total_events < 3:
            trend_direction = "insufficient_data"
            trend_msg = "Requires at least 3 behavior events to calculate a trend."
        else:
            if start_date and end_date:
                total_days = (end_date - start_date).days + 1
                mid_date = start_date + timedelta(days=total_days // 2)
                first_half = [e for e in events if e.check_in and e.check_in.check_in_date < mid_date]
                second_half = [e for e in events if e.check_in and e.check_in.check_in_date >= mid_date]
                
                # If events don't have check_in object loaded in joined result, fallback to list split
                if len(first_half) + len(second_half) == 0:
                    mid = len(events) // 2
                    first_half_len = len(events[:mid])
                    second_half_len = len(events[mid:])
                else:
                    first_half_len = len(first_half)
                    second_half_len = len(second_half)
            else:
                mid = len(events) // 2
                first_half_len = len(events[:mid])
                second_half_len = len(events[mid:])

            if second_half_len > first_half_len:
                trend_direction = "increasing"
            elif second_half_len < first_half_len:
                trend_direction = "decreasing"
            else:
                trend_direction = "stable"

            trend_msg = "Deterministic trend calculated by comparing observation frequency across the selected period windows."

        trend_stat = TrendAnalytics(
            direction=trend_direction,
            method="Deterministic window rate comparison",
            message=trend_msg,
        )

        # 12. Frequent Contexts (Trigger + Emotion combinations)
        context_counter = Counter(
            (e.trigger, e.emotion) for e in events if e.trigger and e.emotion
        )
        frequent_contexts = [
            FrequentContext(
                trigger=trig,
                emotion=emot,
                count=count,
                label="Frequently recorded combination"
            )
            for (trig, emot), count in context_counter.most_common(5)
        ]

        # 13. Parenting Goal Alignment
        active_goals = AnalyticsRepository.get_active_goals(db, child_id=child_id)
        goal_alignment = []
        for goal in active_goals:
            # Related observations calculation
            related_count = sum(
                1 for e in events
                if e.trigger == goal.goal_type
                or e.emotion == goal.goal_type
                or (goal.goal_type == "emotional_regulation" and e.emotion in ["angry", "frustrated", "anxious"])
                or (goal.goal_type == "screen_time" and e.trigger == "screen_time")
                or (goal.goal_type == "sleep" and e.trigger == "bedtime")
            )
            match_type = "trigger" if goal.goal_type in trigger_freqs else "category"
            goal_alignment.append(
                GoalAlignment(
                    goal_type=goal.goal_type,
                    goal_description=goal.description,
                    related_observations=related_count,
                    matching_type=match_type,
                )
            )

        return AnalyticsSummaryResponse(
            child_id=child_id,
            period=PeriodInfo(
                type=period,
                start_date=start_date,
                end_date=end_date,
            ),
            data_sufficiency=data_sufficiency,
            check_ins=CountStat(total=total_check_ins),
            events=CountStat(total=total_events),
            emotions=emotions_stat,
            triggers=triggers_stat,
            intensity=intensity_stat,
            parent_responses=parent_responses_stat,
            outcomes=outcomes_stat,
            recent_activity=recent_activity_stat,
            trend=trend_stat,
            frequent_contexts=frequent_contexts,
            goal_alignment=goal_alignment,
        )
