import io
import json
import logging
import time
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from groq import Groq

from app.core.config import settings
from app.models.child import Child
from app.coach.llm_provider import get_llm_provider
from app.schemas.live_parenting_schemas import (
    LiveGuidanceRequest,
    LiveGuidanceResponse,
    SimliSessionRequest,
    SimliSessionResponse,
    LiveSessionSummaryRequest,
    LiveSessionSummaryResponse
)

logger = logging.getLogger(__name__)


LIVE_PARENTING_SYSTEM_PROMPT = """You are Aaghosh Live Parenting Assistant, an AI coach that listens to a real-time conversation between a parent and their child and provides INSTANT, actionable whispering guidance to the parent.

CRITICAL ROLE & RULES:
1. You are advising the PARENT on what to say and do RIGHT NOW in response to the child's last words or behavior.
2. Provide an EXACT, natural, empathetic script ("immediate_response") that the parent can say out loud to the child immediately.
3. Keep the "immediate_response" concise (1-2 sentences max), child-appropriate for their age, and focused on de-escalation, emotional validation, and gentle boundary holding.
4. NEVER provide medical or psychological diagnoses (no ADHD, Autism, ODD, etc.). Focus on the present emotional state and connection.
5. Provide specific vocal tone guidance (e.g., "Calm, slow cadence, lower pitch", "Warm, curious, gentle").
6. Provide 2-3 immediate physical micro-actions (e.g., "Kneel to eye level", "Offer an open hand", "Take a deep breath together").
7. Highlight what NOT to say or do right now ("what_to_avoid").
8. Always respond with VALID JSON strictly matching this format:
{
  "immediate_response": "Word-for-word sentence parent should speak to child right now",
  "tone_guidance": "Vocal tone, pacing, and presence instructions",
  "child_emotion_detected": "Brief description of the child's emotion or developmental need",
  "action_steps": ["Micro-action 1", "Micro-action 2"],
  "what_to_avoid": "One common reaction to avoid right now",
  "encouragement_for_parent": "Short reassuring phrase for the parent"
}
"""


class LiveParentingService:
    """
    Orchestrates real-time live parenting guidance, Whisper STT,
    Simli interactive avatar sessions, and Cartesia speech.
    """

    def _get_child_info(self, db: Session, child_id: Optional[str], user_id: str) -> Optional[Child]:
        if not child_id:
            return None
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return None
        if str(child.user_id) != str(user_id):
            return None
        return child

    def generate_guidance(
        self,
        db: Session,
        user_id: str,
        request: LiveGuidanceRequest
    ) -> LiveGuidanceResponse:
        start_time = time.time()
        child = self._get_child_info(db, request.child_id, user_id)

        child_name = child.first_name if child else "Child"
        child_age_str = f"{child.age_years} years old" if child and getattr(child, "age_years", None) is not None else "young child"

        goals_text = ""
        strengths_text = ""
        challenges_text = ""
        if child:
            active_goals = [g.goal_type for g in getattr(child, "goals", []) if getattr(g, "is_active", False)]
            if active_goals:
                goals_text = f"Active Goals: {', '.join(active_goals)}"
            profile = getattr(child, "profile", None)
            if profile:
                if getattr(profile, "strengths", None):
                    strengths_text = f"Strengths: {profile.strengths[:150]}"
                if getattr(profile, "challenges", None):
                    challenges_text = f"Known Challenges: {profile.challenges[:150]}"

        # Assemble dialogue history
        history_lines = []
        for turn in request.transcript[-8:]:
            speaker_label = child_name if turn.speaker.lower() == "child" else "Parent"
            history_lines.append(f"{speaker_label}: {turn.text}")

        current_speaker_label = child_name if request.latest_speaker.lower() == "child" else "Parent"
        history_lines.append(f"{current_speaker_label} (JUST NOW): {request.latest_utterance}")
        dialogue_context = "\n".join(history_lines) if history_lines else f"{current_speaker_label}: {request.latest_utterance}"

        is_urdu = request.language == "ur"
        language_instruction = "IMPORTANT: Write the JSON response values in URDU (اردو)." if is_urdu else "IMPORTANT: Write the JSON response values in ENGLISH."

        coach_persona = (
            "You are a friendly, energetic, quick-witted digital AI companion ('Nova/Spark') designed for parents."
            if request.mode == "non_human"
            else "You are 'Dr. Sophia', an ultra-realistic, warm, and deeply experienced parenting and child development specialist."
        )

        user_prompt = f"""
{coach_persona}
Child Name: {child_name}
Child Age: {child_age_str}
{goals_text}
{strengths_text}
{challenges_text}

RECENT LIVE CONVERSATION TURNS:
{dialogue_context}

The {current_speaker_label} just said: "{request.latest_utterance}".
Guide the parent on how to respond IMMEDIATELY with empathy, emotional regulation, and clear guidance.

{language_instruction}
Remember to return ONLY valid JSON.
"""

        # Leverage the existing LLM provider configured in Aagosh AI
        provider = get_llm_provider()
        logger.info(f"[LiveParenting] Using provider {provider.provider_name} ({provider.model_name}) for live guidance")

        try:
            raw_response = provider.generate_response(
                system_prompt=LIVE_PARENTING_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                context={"child": {"name": child_name, "age": child_age_str}},
                language=request.language
            )

            # Defensive fallbacks if LLM returned standard coach fields or live fields
            immediate_resp = (
                raw_response.get("immediate_response")
                or raw_response.get("answer")
                or ("I hear how you feel, let's take a breath together." if not is_urdu else "میں سمجھ رہا ہوں، آئیے مل کر ایک گہرا سانس لیتے ہیں۔")
            )

            tone = (
                raw_response.get("tone_guidance")
                or ("Calm, warm, and unhurried" if not is_urdu else "پرسکون، شفیق اور نرم لہجہ")
            )

            emotion = (
                raw_response.get("child_emotion_detected")
                or ("Seeking validation / big emotions" if not is_urdu else "احساسات کا اظہار / توجہ کی ضرورت")
            )

            actions = raw_response.get("action_steps") or raw_response.get("suggested_steps") or [
                "Get down to eye level",
                "Offer a reassuring touch or open posture"
            ]

            avoid = raw_response.get("what_to_avoid") or (
                "Avoid raising your voice or issuing an ultimatum right now."
                if not is_urdu else "آواز اونچی کرنے یا فوراً سزا دینے سے گریز کریں۔"
            )

            encouragement = raw_response.get("encouragement_for_parent") or (
                "You're doing great. Stay anchored."
                if not is_urdu else "آپ بہت اچھے طریقے سے سنبھال رہے ہیں۔ پرسکون رہیں۔"
            )

            duration = time.time() - start_time
            logger.info(f"[LiveParenting] Generated live guidance in {duration:.2f}s")

            return LiveGuidanceResponse(
                immediate_response=immediate_resp,
                tone_guidance=tone,
                child_emotion_detected=emotion,
                action_steps=actions,
                what_to_avoid=avoid,
                encouragement_for_parent=encouragement,
                child_name=child_name,
                language=request.language,
                mode=request.mode
            )

        except Exception as e:
            logger.error(f"[LiveParenting] Error generating response from provider: {e}")
            # Fallback robust guidance
            if is_urdu:
                return LiveGuidanceResponse(
                    immediate_response="میں سن رہا ہوں، مجھے معلوم ہے یہ مشکل ہے۔ آئیے مل کر حل نکالتے ہیں۔",
                    tone_guidance="نرم، دھیمی اور محبت بھری آواز",
                    child_emotion_detected="جذباتی دباؤ یا مایوسی",
                    action_steps=["بچے کی آنکھوں کے برابر بیٹھیں", "دو آسان راستے پیش کریں"],
                    what_to_avoid="بحث کرنا یا 'چپ ہو جاؤ' کہنا",
                    encouragement_for_parent="ایک گہرا سانس لیں، آپ باکمال والد/والدہ ہیں۔",
                    child_name=child_name,
                    language="ur",
                    mode=request.mode
                )
            return LiveGuidanceResponse(
                immediate_response=f"I hear you, {child_name}. I can see you're feeling strongly about this. Let's work it out together.",
                tone_guidance="Warm, calm, and slow-paced",
                child_emotion_detected="Frustration or overwhelmed feelings",
                action_steps=["Kneel down to eye level", "Acknowledge the feeling before offering a choice"],
                what_to_avoid="Avoid dismissing their feelings or saying 'It's not a big deal'",
                encouragement_for_parent="Take a slow breath. Your calm is your superpower.",
                child_name=child_name,
                language="en",
                mode=request.mode
            )

    async def transcribe_audio_whisper(self, audio_file: UploadFile) -> Dict[str, Any]:
        """
        Transcribes audio using free Groq Whisper (whisper-large-v3-turbo).
        Requires zero paid tools.
        """
        if not settings.LLM_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq Whisper is not configured. Please ensure LLM_API_KEY is set."
            )

        try:
            content = await audio_file.read()
            filename = audio_file.filename or "recording.webm"

            client = Groq(api_key=settings.LLM_API_KEY)
            file_tuple = (filename, content, audio_file.content_type or "audio/webm")

            transcription = client.audio.transcriptions.create(
                file=file_tuple,
                model="whisper-large-v3-turbo",
                response_format="json",
                temperature=0.0
            )

            text = transcription.text.strip() if hasattr(transcription, "text") else str(transcription)
            return {
                "transcript": text,
                "model": "whisper-large-v3-turbo",
                "status": "success"
            }
        except Exception as e:
            logger.error(f"[LiveParenting] Whisper transcription failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Whisper transcription failed: {str(e)}"
            )

    def get_simli_session(self, request: SimliSessionRequest) -> SimliSessionResponse:
        """
        Generates a Simli session token via the /compose/token endpoint.
        Applies a strict 5-minute (300 seconds) session limit.
        """
        api_key = request.api_key or settings.SIMLI_API_KEY
        face_id = request.face_id or settings.SIMLI_FACE_ID
        max_len = min(request.max_session_length, 300)  # Maximum 5 minutes strictly

        if not api_key:
            logger.info("[LiveParenting] Simli API Key not set; providing preview session.")
            return SimliSessionResponse(
                session_token="preview_simli_token_" + str(int(time.time())),
                face_id=face_id,
                max_session_length=max_len,
                status="preview_active",
                message="Add SIMLI_API_KEY to enable live WebRTC avatar."
            )

        try:
            import httpx
            with httpx.Client(timeout=10.0) as client:
                # Use the current Simli v2 token endpoint
                res = client.post(
                    "https://api.simli.ai/compose/token",
                    headers={
                        "Content-Type": "application/json",
                        "X-Simli-Api-Key": api_key
                    },
                    json={
                        "faceId": face_id,
                        "apiVersion": "v2",
                        "handleSilence": True,
                        "maxSessionLength": max_len
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return SimliSessionResponse(
                        session_token=data.get("session_token") or data.get("sessionToken", ""),
                        face_id=face_id,
                        max_session_length=max_len,
                        status="connected",
                        message="Dr. Sophia is ready for your session"
                    )
                else:
                    logger.warning(f"[LiveParenting] Simli API returned {res.status_code}: {res.text}")
                    return SimliSessionResponse(
                        session_token="",
                        face_id=face_id,
                        max_session_length=max_len,
                        status="error",
                        message=f"Could not connect: {res.text[:120]}"
                    )
        except Exception as e:
            logger.error(f"[LiveParenting] Simli session creation error: {e}")
            return SimliSessionResponse(
                session_token="",
                face_id=face_id,
                max_session_length=max_len,
                status="error",
                message=str(e)
            )

    def generate_cartesia_tts(self, text: str, language: str = "en", voice_id: Optional[str] = None, user_key: Optional[str] = None) -> bytes:
        """
        Synthesizes human-like speech via Cartesia Sonic API.
        """
        api_key = user_key or settings.CARTESIA_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Cartesia API key not configured. Browser native high-fidelity TTS will be used."
            )

        chosen_voice = voice_id or settings.CARTESIA_VOICE_ID or "79a125e8-cd45-4c13-8a67-188112f4dd22"
        import httpx
        try:
            with httpx.Client(timeout=15.0) as client:
                response = client.post(
                    "https://api.cartesia.ai/tts/bytes",
                    headers={
                        "X-API-Key": api_key,
                        "Cartesia-Version": "2024-06-10",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model_id": "sonic-latest",
                        "transcript": text,
                        "language": language,
                        "voice": {
                            "mode": "id",
                            "id": chosen_voice
                        },
                        "output_format": {
                            "container": "mp3",
                            "encoding": "mp3",
                            "sample_rate": 44100
                        }
                    }
                )
                if response.status_code == 200:
                    return response.content
                else:
                    logger.error(f"[LiveParenting] Cartesia API error {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Cartesia TTS error: {response.text[:120]}"
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[LiveParenting] Cartesia connection error: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to connect to Cartesia TTS: {str(e)}"
            )

    def generate_summary(
        self,
        db: Session,
        user_id: str,
        request: LiveSessionSummaryRequest
    ) -> LiveSessionSummaryResponse:
        """
        Generates a 5-minute session wrap-up and actionable takeaways.
        """
        child = self._get_child_info(db, request.child_id, user_id)
        child_name = child.first_name if child else "Child"
        is_urdu = request.language == "ur"

        turns = [f"{t.speaker}: {t.text}" for t in request.transcript]
        convo_text = "\n".join(turns) if turns else "No dialogue recorded."

        guidance_prompts = [g.get("immediate_response", "") for g in request.guidance_history if isinstance(g, dict)]
        guidance_text = "\n".join([f"- {g}" for g in guidance_prompts[:5]]) if guidance_prompts else "Standard guidance"

        prompt = f"""Summarize this 5-minute Live Parenting guidance session for {child_name}.
Session Duration: {request.duration_seconds} seconds ({request.duration_seconds // 60} minutes).
Coach Mode: {request.mode}

Conversation Transcript:
{convo_text}

Key Advice Given to Parent:
{guidance_text}

Provide JSON:
{{
  "summary": "2-3 sentence overview of the conversation and emotional dynamic",
  "emotional_climate": "Brief label of child and parent emotional shift",
  "key_breakthroughs": ["Point 1", "Point 2"],
  "actionable_takeaways": ["Takeaway 1 to remember today", "Takeaway 2", "Takeaway 3"]
}}
{"Respond in Urdu." if is_urdu else "Respond in English."}
"""

        provider = get_llm_provider()
        try:
            raw = provider.generate_response(
                system_prompt="You are an expert parenting session debriefer. Output valid JSON only.",
                user_prompt=prompt,
                context={},
                language=request.language
            )
            return LiveSessionSummaryResponse(
                summary=raw.get("summary") or f"Session completed with {child_name}.",
                emotional_climate=raw.get("emotional_climate") or "De-escalated and connected",
                key_breakthroughs=raw.get("key_breakthroughs") or ["Maintained calm presence", "Validated feelings"],
                actionable_takeaways=raw.get("actionable_takeaways") or ["Keep offering limited choices", "Celebrate small transitions"],
                child_name=child_name
            )
        except Exception as e:
            logger.error(f"[LiveParenting] Summary generation error: {e}")
            return LiveSessionSummaryResponse(
                summary=f"5-minute live parenting session concluded with {child_name}. You successfully navigated the interaction using empathetic boundaries.",
                emotional_climate="Connected & regulated",
                key_breakthroughs=["Stayed calm under emotional pressure", "Gave clear, supportive guidance"],
                actionable_takeaways=["Review how your tone affected the child's response", "Offer choices during upcoming transitions"],
                child_name=child_name
            )

    def generate_livekit_token(self, request) -> Any:
        from livekit import api
        from fastapi import HTTPException, status
        from app.schemas.live_parenting_schemas import LiveKitTokenResponse

        api_key = settings.LIVEKIT_API_KEY
        api_secret = settings.LIVEKIT_API_SECRET
        livekit_url = settings.LIVEKIT_URL

        if not api_key or not api_secret or not livekit_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="LiveKit Cloud credentials are not fully configured in backend."
            )

        token = api.AccessToken(api_key, api_secret) \
            .with_identity(request.participant_identity) \
            .with_name(request.participant_identity) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=request.room_name,
                can_publish=True,
                can_subscribe=True
            ))

        return LiveKitTokenResponse(
            token=token.to_jwt(),
            url=livekit_url
        )

live_parenting_service = LiveParentingService()
