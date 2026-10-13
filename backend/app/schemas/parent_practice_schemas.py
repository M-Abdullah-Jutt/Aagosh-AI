from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ScenarioItem(BaseModel):
    id: str
    category: str
    title: str
    title_ur: str
    child_age: int
    child_name: str
    description: str
    description_ur: str
    initial_child_message: str
    initial_child_message_ur: str
    emotional_state: str
    behavior_type: str
    learning_goal: str
    learning_goal_ur: str
    difficulty: str  # Beginner, Intermediate, Advanced
    avatar_color: str


class ParentPracticeTurn(BaseModel):
    speaker: str  # 'child' or 'parent'
    text: str
    timestamp: Optional[str] = None


class PracticeTurnRequest(BaseModel):
    scenario_id: str
    child_name: str
    child_age: int
    behavior_type: str
    transcript: List[ParentPracticeTurn] = Field(default_factory=list)
    parent_response: str
    language: str = "en"  # "en" or "ur"


class PracticeTurnResponse(BaseModel):
    child_reply: str
    child_emotion: str
    child_body_language: Optional[str] = None
    coach_whisper_feedback: Optional[str] = None  # Brief hint/evaluation for parent's move
    is_scenario_resolving: bool = False


class PracticeDebriefRequest(BaseModel):
    scenario_id: str
    scenario_title: str
    child_name: str
    child_age: int
    behavior_type: str
    transcript: List[ParentPracticeTurn] = Field(default_factory=list)
    duration_seconds: int = 180
    language: str = "en"  # "en" or "ur"


class FeedbackItem(BaseModel):
    parent_utterance: str
    what_went_wrong: str
    why_it_escalated: str
    better_alternative: str


class PracticeDebriefResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Parenting empathy & effectiveness score out of 100")
    summary: str
    parent_wrong_behaviors: List[FeedbackItem] = Field(default_factory=list)
    what_parent_did_well: List[str] = Field(default_factory=list)
    key_recommendations: List[str] = Field(default_factory=list)
    emotional_trajectory: str
    scenario_completed: bool = True
