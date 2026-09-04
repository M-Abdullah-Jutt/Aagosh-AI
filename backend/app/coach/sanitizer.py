import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMContextSanitizer:
    """
    Sanitizes and strips sensitive/unnecessary data from the Step 8A assembled context object
    before passing it to the Prompt Builder and LLM Provider.
    """

    @staticmethod
    def sanitize(assembled_context: Dict[str, Any], max_knowledge_chunks: int = None, max_obs_len: int = None) -> Dict[str, Any]:
        if max_knowledge_chunks is None:
            max_knowledge_chunks = settings.MAX_KNOWLEDGE_CHUNKS
        if max_obs_len is None:
            max_obs_len = settings.MAX_OBSERVATION_TEXT_LENGTH

        child_info = assembled_context.get("child") or assembled_context.get("child_info") or {}
        analytics = assembled_context.get("analytics") or {}
        retrieved_knowledge = assembled_context.get("retrieved_knowledge") or []
        
        goals = assembled_context.get("parenting_goals") or assembled_context.get("active_goals") or []
        
        obs = assembled_context.get("recent_observations")
        if isinstance(obs, dict):
            recent_events = obs.get("behavior_events") or []
        elif isinstance(obs, list):
            recent_events = obs
        else:
            recent_events = assembled_context.get("recent_behavior_events") or []

        # 1. Child context (minimal: age, gender if present, no parent user_id, pass hashes, tokens)
        sanitized_child = {
            "name": child_info.get("first_name", "the child"),
            "age_years": child_info.get("age_years"),
            "age_months": child_info.get("age_months"),
            "age_group": child_info.get("age_group", "unknown"),
        }

        # 2. Goals (names and descriptions only)
        sanitized_goals = []
        for g in goals:
            if isinstance(g, str):
                sanitized_goals.append(g)
            elif isinstance(g, dict):
                title = g.get("goal_name") or g.get("goal_type") or g.get("title") or ""
                target = g.get("target_behavior") or g.get("description") or ""
                if title or target:
                    sanitized_goals.append(f"{title}: {target}".strip(": "))

        # 3. Behavior events/observations (summarized/truncated safely)
        sanitized_events = []
        for ev in recent_events[:5]:  # limit to max 5 recent events
            if isinstance(ev, str):
                entry = ev
            elif isinstance(ev, dict):
                trigger = ev.get("trigger", "unspecified trigger")
                emotion = ev.get("primary_emotion", "unspecified emotion")
                intensity = ev.get("intensity", "")
                notes = (ev.get("notes") or "").strip()
                if len(notes) > max_obs_len:
                    notes = notes[:max_obs_len] + "..."
                
                entry = f"Trigger: {trigger}, Emotion: {emotion} (Intensity: {intensity})"
                if notes:
                    entry += f", Note: {notes}"
            else:
                continue
            sanitized_events.append(entry)

        # 4. Analytics (descriptive only, remove internal queries/IDs)
        status_flag = analytics.get("status", "")
        summary_analytics = {
            "status": status_flag,
            "total_events": analytics.get("total_events_in_period", 0),
            "most_frequent_trigger": analytics.get("most_frequent_trigger"),
            "most_frequent_emotion": analytics.get("most_frequent_emotion"),
            "average_intensity": analytics.get("average_intensity"),
            "insufficient_data": status_flag == "insufficient_data" or analytics.get("total_events_in_period", 0) < 3,
        }

        # 5. Retrieved Knowledge (limit to max_knowledge_chunks, format cleanly with source metadata)
        sanitized_chunks = []
        for idx, chunk in enumerate(retrieved_knowledge[:max_knowledge_chunks], start=1):
            meta = chunk.get("metadata", {})
            sanitized_chunks.append({
                "chunk_id": f"SOURCE_{idx}",
                "source": meta.get("source", "Parenting Knowledge Base"),
                "page": meta.get("page"),
                "category": meta.get("category", "General"),
                "tags": meta.get("tags", []),
                "content": chunk.get("content", "").strip(),
            })

        sanitized_payload = {
            "child": sanitized_child,
            "goals": sanitized_goals,
            "recent_observations": sanitized_events,
            "analytics": summary_analytics,
            "retrieved_knowledge": sanitized_chunks,
        }

        return sanitized_payload
