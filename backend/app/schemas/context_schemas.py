from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.analytics_schemas import AnalyticsSummaryResponse
from app.knowledge.schemas import SearchResult



class ContextChildInfo(BaseModel):
    id: str
    first_name: str
    date_of_birth: date
    gender: Optional[str] = None
    age_years: int
    age_months: int
    age_display: str


class ContextProfileInfo(BaseModel):
    strengths: Optional[str] = None
    challenges: Optional[str] = None
    personality_notes: Optional[str] = None
    communication_style: Optional[str] = None


class ContextGoalInfo(BaseModel):
    id: str
    goal_type: str
    description: Optional[str] = None
    priority: str
    is_active: bool


class ContextCheckInInfo(BaseModel):
    id: str
    check_in_date: date
    overall_mood: str
    general_notes: Optional[str] = None


class ContextBehaviorEventInfo(BaseModel):
    id: str
    check_in_id: str
    event_date: Optional[date] = None
    emotion: str
    intensity: int
    trigger: Optional[str] = None
    behavior_description: str
    parent_response: Optional[str] = None
    outcome: Optional[str] = None


class ContextRecentObservations(BaseModel):
    check_ins: List[ContextCheckInInfo] = Field(default_factory=list)
    behavior_events: List[ContextBehaviorEventInfo] = Field(default_factory=list)


class ContextMetadata(BaseModel):
    query: str
    analytics_period: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    knowledge_results_count: int
    limits: Dict[str, int]


class ContextAssemblyRequest(BaseModel):
    query: str = Field(..., description="Parent question or situation query")
    period: str = Field("30d", description="Analytics period: 7d, 14d, 30d, all")
    max_check_ins: Optional[int] = Field(None, description="Max recent check-ins limit (default 5)")
    max_events: Optional[int] = Field(None, description="Max recent behavior events limit (default 10)")
    top_k_knowledge: Optional[int] = Field(None, description="Top-K knowledge results limit (default 5)")


class AssembledContextResponse(BaseModel):
    child: ContextChildInfo
    profile: Optional[ContextProfileInfo] = None
    parenting_goals: List[ContextGoalInfo] = Field(default_factory=list)
    recent_observations: ContextRecentObservations
    analytics: AnalyticsSummaryResponse
    retrieved_knowledge: List[SearchResult] = Field(default_factory=list)
    metadata: ContextMetadata
