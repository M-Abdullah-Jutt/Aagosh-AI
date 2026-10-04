import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.live_parenting_schemas import (
    LiveGuidanceRequest,
    LiveGuidanceResponse,
    SimliSessionRequest,
    SimliSessionResponse,
    CartesiaTTSRequest,
    LiveSessionSummaryRequest,
    LiveSessionSummaryResponse,
    LiveKitTokenRequest,
    LiveKitTokenResponse
)
from app.services.live_parenting_service import live_parenting_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/guide",
    response_model=LiveGuidanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get real-time live parenting guidance",
    description="Analyzes live dialogue between parent and child, and returns immediate split-second guidance."
)
def get_live_guidance(
    payload: LiveGuidanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> LiveGuidanceResponse:
    return live_parenting_service.generate_guidance(
        db=db,
        user_id=str(current_user.id),
        request=payload
    )


@router.post(
    "/transcribe",
    summary="Transcribe conversation audio with Whisper",
    description="Transcribes audio chunks or recordings using Whisper STT without paid tools."
)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    return await live_parenting_service.transcribe_audio_whisper(file)


@router.post(
    "/simli-session",
    response_model=SimliSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Start Simli AI Avatar Session",
    description="Initiates a 5-minute interactive photorealistic Simli WebRTC avatar session."
)
def create_simli_session(
    payload: Optional[SimliSessionRequest] = None,
    current_user: User = Depends(get_current_user)
) -> SimliSessionResponse:
    req = payload or SimliSessionRequest()
    return live_parenting_service.get_simli_session(req)


@router.post(
    "/cartesia-tts",
    summary="Synthesize speech via Cartesia Sonic",
    description="Generates ultra-realistic human speech audio from guidance text via Cartesia."
)
def generate_cartesia_tts(
    payload: CartesiaTTSRequest,
    current_user: User = Depends(get_current_user)
):
    audio_bytes = live_parenting_service.generate_cartesia_tts(
        text=payload.transcript,
        language=payload.language,
        voice_id=payload.voice_id,
        user_key=payload.api_key
    )
    return Response(content=audio_bytes, media_type="audio/mpeg")


@router.post(
    "/summary",
    response_model=LiveSessionSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate 5-Minute Live Parenting Session Summary",
    description="Summarizes the session outcomes, emotional shifts, and key takeaways for the day."
)
def get_session_summary(
    payload: LiveSessionSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> LiveSessionSummaryResponse:
    return live_parenting_service.generate_summary(
        db=db,
        user_id=str(current_user.id),
        request=payload
    )

@router.post(
    "/livekit-token",
    response_model=LiveKitTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate LiveKit Access Token",
    description="Generates a token to join a LiveKit room for AI avatar WebRTC transport."
)
def get_livekit_token(
    payload: LiveKitTokenRequest,
    current_user: User = Depends(get_current_user)
) -> LiveKitTokenResponse:
    return live_parenting_service.generate_livekit_token(payload)
