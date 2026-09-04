from datetime import date
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PeriodInfo(BaseModel):
    type: str = Field(..., description="Period type: 7d, 14d, 30d, all")
    start_date: Optional[date] = None
    end_date: date


class DataSufficiency(BaseModel):
    level: str = Field(..., description="insufficient_data, early_observations, basic_pattern_analysis")
    event_count: int
    message: str


class CountStat(BaseModel):
    total: int


class EmotionAnalytics(BaseModel):
    frequencies: Dict[str, int] = Field(default_factory=dict)
    most_observed: Optional[str] = None
    label: str = "Most frequently observed emotion"


class TriggerAnalytics(BaseModel):
    frequencies: Dict[str, int] = Field(default_factory=dict)
    percentages: Dict[str, float] = Field(default_factory=dict)
    most_observed: Optional[str] = None
    label: str = "Most frequently observed trigger"


class IntensityAnalytics(BaseModel):
    average: float = 0.0
    minimum: int = 0
    maximum: int = 0
    distribution: Dict[str, int] = Field(default_factory=dict)
    label: str = "Observed intensity"


class FrequencyBreakdown(BaseModel):
    frequencies: Dict[str, int] = Field(default_factory=dict)


class RecentActivity(BaseModel):
    current_period_events: int
    previous_period_events: Optional[int] = None
    change_count: Optional[int] = None
    change_percentage: Optional[float] = None
    summary_message: str


class TrendAnalytics(BaseModel):
    direction: str = Field(..., description="increasing, decreasing, stable, insufficient_data")
    method: str = "Deterministic window rate comparison"
    message: str


class FrequentContext(BaseModel):
    trigger: str
    emotion: str
    count: int
    label: str = "Frequently recorded combination"


class GoalAlignment(BaseModel):
    goal_type: str
    goal_description: Optional[str] = None
    related_observations: int
    matching_type: str = "trigger"


class AnalyticsSummaryResponse(BaseModel):
    child_id: str
    period: PeriodInfo
    data_sufficiency: DataSufficiency
    check_ins: CountStat
    events: CountStat
    emotions: EmotionAnalytics
    triggers: TriggerAnalytics
    intensity: IntensityAnalytics
    parent_responses: FrequencyBreakdown
    outcomes: FrequencyBreakdown
    recent_activity: RecentActivity
    trend: TrendAnalytics
    frequent_contexts: List[FrequentContext] = Field(default_factory=list)
    goal_alignment: List[GoalAlignment] = Field(default_factory=list)
