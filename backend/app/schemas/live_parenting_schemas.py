from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class LiveTranscriptItem(BaseModel):
    speaker: str = Field(..., description="'child' or 'parent'")
    text: str = Field(..., description="Spoken utterance text")
    timestamp: Optional[str] = None


class LiveGuidanceRequest(BaseModel):
    child_id: Optional[str] = Field(None, description="Optional Child ID to incorporate profile and active goals")
    transcript: List[LiveTranscriptItem] = Field(default_factory=list, description="Recent conversation turns")
    latest_utterance: str = Field(..., description="Latest utterance spoken by either child or parent")
    latest_speaker: str = Field("child", description="'child' or 'parent'")
    mode: str = Field("non_human", description="'non_human' or 'human_like'")
    language: str = Field("en", description="'en' or 'ur'")

    @field_validator("latest_speaker")
    @classmethod
    def validate_speaker(cls, v: str) -> str:
        s = v.strip().lower()
        if s not in {"child", "parent"}:
            return "child"
        return s

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        m = v.strip().lower()
        if m not in {"non_human", "human_like"}:
            return "non_human"
        return m

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        l = v.strip().lower()
        if l.startswith("ur"):
            return "ur"
        return "en"


class LiveGuidanceResponse(BaseModel):
    immediate_response: str = Field(..., description="Exact empathetic script for the parent to say right now")
    tone_guidance: str = Field(..., description="Vocal tone and pacing instructions")
    child_emotion_detected: str = Field(..., description="Detected emotional / behavioral state of the child")
    action_steps: List[str] = Field(default_factory=list, description="Immediate body language and environmental micro-actions")
    what_to_avoid: Optional[str] = Field(None, description="Phrases or actions to avoid in this exact moment")
    encouragement_for_parent: Optional[str] = Field(None, description="Reassuring anchor for the parent")
    child_name: Optional[str] = None
    language: str = "en"
    mode: str = "non_human"


class SimliSessionRequest(BaseModel):
    face_id: Optional[str] = None
    api_key: Optional[str] = None
    max_session_length: int = Field(300, description="Strict 5-minute session limit (300 seconds)")
    max_idle_time: int = 120


class SimliSessionResponse(BaseModel):
    session_token: Optional[str] = None
    face_id: str
    max_session_length: int
    status: str
    message: Optional[str] = None


class CartesiaTTSRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=2000)
    voice_id: Optional[str] = None
    api_key: Optional[str] = None
    language: str = "en"


class LiveSessionSummaryRequest(BaseModel):
    child_id: Optional[str] = None
    duration_seconds: int = 300
    transcript: List[LiveTranscriptItem] = Field(default_factory=list)
    guidance_history: List[Dict[str, Any]] = Field(default_factory=list)
    mode: str = "non_human"
    language: str = "en"


class LiveSessionSummaryResponse(BaseModel):
    summary: str
    emotional_climate: str
    key_breakthroughs: List[str] = Field(default_factory=list)
    actionable_takeaways: List[str] = Field(default_factory=list)
    child_name: Optional[str] = None

class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_identity: str

class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
