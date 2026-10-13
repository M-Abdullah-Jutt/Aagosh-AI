import json
import logging
from typing import List, Dict, Any, Optional

from app.coach.llm_provider import get_llm_provider
from app.schemas.parent_practice_schemas import (
    ScenarioItem,
    PracticeTurnRequest,
    PracticeTurnResponse,
    PracticeDebriefRequest,
    PracticeDebriefResponse,
    FeedbackItem
)

logger = logging.getLogger(__name__)

# Predefined curated child behavior scenarios based on real parenting dilemmas
PRACTICE_SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "screen_time_tantrum",
        "category": "Boundaries & Screen Time",
        "title": "Screen Time Meltdown",
        "title_ur": "اسکرین ٹائم ختم ہونے پر غصہ اور رونا",
        "child_age": 5,
        "child_name": "Daniyal",
        "description": "It's time to turn off the tablet for dinner, but 5-year-old Daniyal screams, throws the tablet on the couch, and yells that you are the worst parent.",
        "description_ur": "کھانے کا وقت ہو چکا ہے اور ٹیبلٹ بند کرنے کو کہا گیا، لیکن 5 سالہ دانیال چیخنے لگا، ٹیبلٹ صوفے پر پھینک دیا اور غصے سے رو رہا ہے۔",
        "initial_child_message": "NO! I will NOT turn it off! You always ruin everything, you're the worst! I hate dinner!",
        "initial_child_message_ur": "نہیں! میں بند نہیں کروں گا! آپ ہمیشہ میرا کھیل خراب کرتے ہیں، میں کھانا نہیں کھاؤں گا!",
        "emotional_state": "Enraged & Overstimulated",
        "behavior_type": "Tantrum & Defiance",
        "learning_goal": "Hold clear firm boundary calmly without yelling, shaming, or giving in.",
        "learning_goal_ur": "بغیر چیخے اور بغیر پیچھے ہٹے پرسکون انداز میں حد قائم کرنا۔",
        "difficulty": "Beginner",
        "avatar_color": "from-amber-400 to-orange-500"
    },
    {
        "id": "bedtime_delaying",
        "category": "Sleep & Routine",
        "title": "Bedtime Resistance & Delay Tactics",
        "title_ur": "سوتے وقت بہانے اور ضد کرنا",
        "child_age": 4,
        "child_name": "Ayla",
        "description": "It is 9:30 PM. Ayla keeps asking for water, one more story, says her blanket is itchy, and begins crying when told to lie down.",
        "description_ur": "رات کے ساڑھے نو بج رہے ہیں۔ 4 سالہ آئلہ بار بار پانی مانگ رہی ہے، ایک اور کہانی کی ضد کرتی ہے اور لیٹنے پر رونے لگتی ہے۔",
        "initial_child_message": "I'm not sleepy at all! My legs hurt, I need water, and you have to stay here until morning! Don't leave!",
        "initial_child_message_ur": "مجھے بالکل نیند نہیں آرہی! میری ٹانگوں میں درد ہے، مجھے پانی چاہیے اور آپ کو یہیں بیٹھنا پڑے گا!",
        "emotional_state": "Anxious & Separation Seeking",
        "behavior_type": "Bedtime Resistance",
        "learning_goal": "Validate bedtime anxiety while maintaining predictable bedtime structure.",
        "learning_goal_ur": "بچے کے خوف کو سمجھے ہوئے سونے کے معمول پر نرمی اور سختی کا توازن رکھنا۔",
        "difficulty": "Beginner",
        "avatar_color": "from-indigo-400 to-purple-500"
    },
    {
        "id": "sibling_physical_aggression",
        "category": "Sibling Conflict",
        "title": "Sibling Toy Fight & Hitting",
        "title_ur": "بہن بھائی میں کھلونا چھیننا اور مارنا",
        "child_age": 6,
        "child_name": "Zayd",
        "description": "Zayd snatched a toy truck from his younger 3-year-old sister and pushed her to the ground when she tried to grab it back.",
        "description_ur": "6 سالہ زید نے اپنی 3 سالہ چھوٹی بہن سے زبردستی کھلونا چھین لیا اور بہن کے مانگنے پر اسے دھکا دے دیا۔",
        "initial_child_message": "It was mine first! She always touches my things and breaks them! She deserved to be pushed!",
        "initial_child_message_ur": "یہ کھلونا پہلے میرا تھا! وہ ہمیشہ میری چیزیں چھوتی ہے، اس لیے میں نے اسے دھکا دیا!",
        "emotional_state": "Defensive & Jealous",
        "behavior_type": "Physical Aggression & Blame",
        "learning_goal": "Stop aggression immediately, prioritize safety, and teach repair without harsh punishment.",
        "learning_goal_ur": "جارحیت کو فوراً روکنا، معذرت سکھانا اور بلاوجہ چیخ و پکار سے پرہیز کرنا۔",
        "difficulty": "Intermediate",
        "avatar_color": "from-rose-400 to-red-500"
    },
    {
        "id": "public_grocery_meltdown",
        "category": "Public Outbursts",
        "title": "Grocery Store Candy Checkout Meltdown",
        "title_ur": "مارکیٹ میں کینڈی کے لیے زمین پر بیٹھ کر رونا",
        "child_age": 4,
        "child_name": "Mirha",
        "description": "You are at the grocery store checkout with people watching. Mirha demands a chocolate bar. When you say no, she drops to the floor and starts screaming.",
        "description_ur": "آپ خریداری کے بعد کاؤنٹر پر ہیں اور لوگ دیکھ رہے ہیں۔ 4 سالہ مرہا چاکلیٹ مانگتی ہے اور انکار پر زمین پر لیٹ کر چیخنا شروع کر دیتی ہے۔",
        "initial_child_message": "I WANT THE CHOCOLATE! BUY IT NOW! Everyone has one, you are mean! *crying loudly on the floor*",
        "initial_child_message_ur": "مجھے چاکلیٹ چاہیے! ابھی خریدیں! آپ بہت برے ہیں! *زمین پر لیٹ کر چیخ رہی ہے*",
        "emotional_state": "Overwhelmed & Demanding",
        "behavior_type": "Public Meltdown",
        "learning_goal": "Regulate parental embarrassment, connect physically, and guide child out without bribing.",
        "learning_goal_ur": "لوگوں کی پرواہ کیے بغیر بچے کے ساتھ رابطہ قائم رکھنا اور رشوت دیے بغیر مسئلہ حل کرنا۔",
        "difficulty": "Intermediate",
        "avatar_color": "from-teal-400 to-emerald-600"
    },
    {
        "id": "homework_refusal",
        "category": "Academic & Focus",
        "title": "Homework Frustration & Defeatism",
        "title_ur": "ہوم ورک نہ کرنے کی ضد اور مایوسی",
        "child_age": 8,
        "child_name": "Rayyan",
        "description": "Rayyan has math worksheets due tomorrow. He scribbles violently on the paper, rips a page, and says 'I'm stupid, I'm never doing this school garbage.'",
        "description_ur": "8 سالہ ریان ہوم ورک کرنے بیٹھا، ریاضی کا سوال حل نہ ہونے پر اس نے کاپی پر لکیریں ماریں، صفحہ پھاڑ دیا اور کہا کہ میں نالائق ہوں۔",
        "initial_child_message": "I'm stupid! The teacher hates me and this math makes no sense! I'm not doing it and you can't make me!",
        "initial_child_message_ur": "میں نالائق ہوں! مجھ سے یہ نہیں ہوتا! میں یہ بیکار ہوم ورک کبھی نہیں کروں گا!",
        "emotional_state": "Shame & Academic Frustration",
        "behavior_type": "Defeatism & Task Avoidance",
        "learning_goal": "De-escalate academic shame, separate worth from performance, and scaffold small steps.",
        "learning_goal_ur": "مایوسی کو دور کرنا، ڈانٹنے کے بجائے چھوٹے مراحل میں مدد فراہم کرنا۔",
        "difficulty": "Intermediate",
        "avatar_color": "from-blue-400 to-indigo-600"
    },
    {
        "id": "eating_vegetables_battle",
        "category": "Mealtime & Health",
        "title": "Mealtime Picky Eater Strike",
        "title_ur": "کھانے کے وقت سبزیوں پر انکار اور نخرے",
        "child_age": 5,
        "child_name": "Haniya",
        "description": "Dinner is served. Haniya pushes the plate away, gags dramatically at the cooked vegetables, and demands chicken nuggets or cookies instead.",
        "description_ur": "کھانا سامنے آنے پر 5 سالہ ہانیہ نے پلیٹ دور دھکیل دی، قے جیسا منہ بنایا اور نگیٹس یا بسکٹ کا مطالبہ کیا۔",
        "initial_child_message": "YUCK! This looks like poop! I'm not eating this yucky green food! Make me nuggets right now!",
        "initial_child_message_ur": "چھین! یہ کتنا گندا کھانا ہے! میں یہ ہری سبزیاں بالکل نہیں کھاؤں گی، میرے لیے بسکٹ لائیں!",
        "emotional_state": "Stubborn & Testing Limits",
        "behavior_type": "Food Neophobia & Demanding",
        "learning_goal": "Avoid food power struggles; adopt division of responsibility at mealtime.",
        "learning_goal_ur": "کھانے پر بحث و تکرار سے بچنا اور پرسکون انداز میں کھانے کا انتخاب دینا۔",
        "difficulty": "Beginner",
        "avatar_color": "from-emerald-400 to-green-600"
    }
]


class ParentPracticeService:
    """
    Manages interactive Virtual Child simulation sessions and
    AI Coach post-session debriefing evaluations.
    """

    def get_all_scenarios(self) -> List[Dict[str, Any]]:
        return PRACTICE_SCENARIOS

    def get_scenario_by_id(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        for s in PRACTICE_SCENARIOS:
            if s["id"] == scenario_id:
                return s
        return None

    def simulate_child_turn(self, req: PracticeTurnRequest) -> PracticeTurnResponse:
        """
        Simulates how the virtual child responds to the parent's actual words.
        If parent is aggressive, child escalates or shuts down.
        If parent is empathetic and firm, child gradually regulates.
        Also produces a discreet coach whisper to guide the parent in real time.
        """
        scenario = self.get_scenario_by_id(req.scenario_id)
        is_urdu = req.language == "ur"

        history_lines = []
        for turn in req.transcript:
            spk = req.child_name if turn.speaker == "child" else "Parent"
            history_lines.append(f"{spk}: {turn.text}")
        history_str = "\n".join(history_lines) if history_lines else f"{req.child_name}: (Initial event)"

        lang_format_rule = (
            "IMPORTANT: Because language is URDU, ALL string values in the JSON (child_reply, child_emotion, child_body_language, coach_whisper_feedback) MUST be written in URDU script (اردو رسم الخط). Do NOT output English or Roman Urdu."
            if is_urdu
            else "Write all values in natural ENGLISH."
        )

        system_prompt = f"""You are simulating a realistic {req.child_age}-year-old child named {req.child_name}.
Current Scenario: {req.behavior_type}
You must respond AS THE CHILD directly to what the parent just said or did.

HOW A REAL {req.child_age}-YEAR-OLD BEHAVES:
1. If the parent yells, threatens, uses sarcasm, bribes, or invalidates feelings:
   - REACT naturally: Cry louder, stomp feet, cross arms, yell back, shut down, or say "I don't care!". DO NOT magically cooperate if parent uses poor tactics.
2. If the parent gets down to eye level, speaks with calm empathy, validates emotions, and holds a kind but firm boundary:
   - SLOWLY begin to soften: Sniffle, look at them, pout, agree with a sigh, or express the real underlying vulnerability ("I was just tired...").
3. Speak in authentic {req.child_age}-year-old vocabulary. Keep speech short (1-2 sentences), emotionally reactive.
4. Also provide a realistic body language cue.
5. In "coach_whisper_feedback", act as an AI parenting observer providing a 1-sentence tip on whether the parent's approach is calming or escalating the child.

{lang_format_rule}

Respond strictly in valid JSON:
{{
  "child_reply": "Exact words the child says right now",
  "child_emotion": "Current emotional state",
  "child_body_language": "Physical reaction",
  "coach_whisper_feedback": "Short constructive feedback for parent's move",
  "is_scenario_resolving": true/false
}}
"""

        urdu_instruction = (
            "CRITICAL LANGUAGE RULE: You MUST speak in authentic URDU script (اردو رسم الخط - e.g. 'نہیں! میں بند نہیں کروں گا'). "
            "DO NOT write in Roman Urdu or English transliteration. All values must be in proper Urdu."
            if is_urdu
            else "Respond in natural ENGLISH."
        )

        user_prompt = f"""
CONVERSATION SO FAR:
{history_str}

PARENT JUST SAID TO THE CHILD:
"{req.parent_response}"

Simulate {req.child_name}'s realistic response.
{urdu_instruction}
Return JSON only.
"""

        provider = get_llm_provider()
        try:
            raw = provider.generate_response(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                context={"child_name": req.child_name, "age": req.child_age},
                language=req.language
            )

            child_reply = raw.get("child_reply") or (
                "FINE! But I'm still mad!" if not is_urdu else "ٹھیک ہے! لیکن میں اب بھی ناراض ہوں!"
            )
            child_emotion = raw.get("child_emotion") or "Upset"
            child_body_language = raw.get("child_body_language") or "Looks away with crossed arms"
            coach_whisper = raw.get("coach_whisper_feedback") or "Stay calm and keep your tone gentle."
            resolving = bool(raw.get("is_scenario_resolving", False))

            return PracticeTurnResponse(
                child_reply=child_reply,
                child_emotion=child_emotion,
                child_body_language=child_body_language,
                coach_whisper_feedback=coach_whisper,
                is_scenario_resolving=resolving
            )
        except Exception as e:
            logger.error(f"[ParentPractice] Error simulating child turn: {e}")
            # Fallback deterministic response
            return PracticeTurnResponse(
                child_reply="*sniffles* But why do you always tell me what to do?!" if not is_urdu else "*روتے ہوئے* لیکن آپ ہمیشہ مجھے ہی کیوں منع کرتے ہیں؟!",
                child_emotion="Frustrated & Listening",
                child_body_language="Turns body slightly, eyes teary",
                coach_whisper_feedback="Acknowledge the frustration before reiterating your boundary.",
                is_scenario_resolving=False
            )

    def generate_debrief(self, req: PracticeDebriefRequest) -> PracticeDebriefResponse:
        """
        Analyzes the full practice session. Highlights exact parent wrong behaviors,
        evaluates tone and mistakes, provides positive reinforcement, and gives actionable recommendations.
        """
        is_urdu = req.language == "ur"
        dialogue_turns = []
        for t in req.transcript:
            speaker = "Parent" if t.speaker == "parent" else f"{req.child_name} (Child)"
            dialogue_turns.append(f"{speaker}: {t.text}")
        dialogue_text = "\n".join(dialogue_turns) if dialogue_turns else "No dialogue recorded."

        system_prompt = """You are Aaghosh AI Parenting Evaluator.
Your job is to thoroughly evaluate a parent who just completed a practice roleplay session communicating with a virtual child.

YOU MUST BE HIGHLY SPECIFIC AND ACTIONABLE:
1. Examine the parent's actual utterances in the transcript.
2. Identify specific wrong behaviors, mistakes, or counterproductive moves the parent made:
   - Examples: Yelling/threats, invalidating emotions ("stop crying it's not a big deal"), bribing with treats, escalating sarcasm, giving up boundaries, lecturing/over-explaining.
   - For each mistake, quote the exact parent utterance, explain what went wrong, why it made the child escalate or shut down, and give a superior alternative script.
3. Identify what the parent did WELL (patience, eye-level, calming words, clear limits).
4. Give an overall score (0-100) reflecting parenting empathy and effective regulation.
5. Provide 3-4 golden recommendations for this specific scenario in real life.

Strictly respond in JSON format matching:
{
  "overall_score": 75,
  "summary": "2-3 sentences overview of the parent's performance and impact on the child",
  "parent_wrong_behaviors": [
    {
      "parent_utterance": "Quote from transcript where parent erred",
      "what_went_wrong": "Specific explanation of the mistake (e.g. Invalidating feeling / Empty threat)",
      "why_it_escalated": "How this impacted the child's nervous system",
      "better_alternative": "Exact words parent should have said instead"
    }
  ],
  "what_parent_did_well": [
    "Positive point 1",
    "Positive point 2"
  ],
  "key_recommendations": [
    "Actionable real-life rule 1",
    "Actionable real-life rule 2",
    "Actionable real-life rule 3"
  ],
  "emotional_trajectory": "Brief description of how the emotional tension evolved"
}
"""

        debrief_language_instruction = (
            "CRITICAL LANGUAGE DIRECTIVE: Output ALL values strictly in authentic Urdu script (اردو رسم الخط - نستعلیق / نسخ). "
            "Do NOT write in Roman Urdu. Every feedback item, explanation, alternative sentence, and recommendation MUST be in beautiful, grammatically correct Urdu."
            if is_urdu
            else "Respond strictly with all JSON values in ENGLISH."
        )

        user_prompt = f"""
SCENARIO: {req.scenario_title}
CHILD: {req.child_name} ({req.child_age} years old)
BEHAVIOR TESTED: {req.behavior_type}
DURATION: {req.duration_seconds} seconds

FULL PRACTICE SESSION TRANSCRIPT:
{dialogue_text}

Perform an in-depth parenting performance audit.
{debrief_language_instruction}
Output JSON only.
"""

        provider = get_llm_provider()
        try:
            raw = provider.generate_response(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                context={"child_name": req.child_name, "scenario": req.scenario_title},
                language=req.language
            )

            score = int(raw.get("overall_score") or 78)
            score = max(10, min(100, score))
            summary = raw.get("summary") or f"Practice session for {req.scenario_title} completed. You navigated the situation with growing awareness."
            
            wrong_behaviors_raw = raw.get("parent_wrong_behaviors") or []
            wrong_behaviors: List[FeedbackItem] = []
            for b in wrong_behaviors_raw:
                if isinstance(b, dict):
                    wrong_behaviors.append(FeedbackItem(
                        parent_utterance=b.get("parent_utterance") or "Parent response",
                        what_went_wrong=b.get("what_went_wrong") or "Ineffective communication pattern",
                        why_it_escalated=b.get("why_it_escalated") or "Triggered child's defensive response",
                        better_alternative=b.get("better_alternative") or "Use calm validation and clear boundaries"
                    ))

            if not wrong_behaviors:
                wrong_behaviors.append(FeedbackItem(
                    parent_utterance="Initial approach",
                    what_went_wrong="Rushed to solve the problem before acknowledging the child's intense emotion." if not is_urdu else "بچے کے جذبات کو سنے بغیر فوراً مسئلہ حل کرنے کی کوشش کی۔",
                    why_it_escalated="Children need connection before they can accept correction." if not is_urdu else "بچے اصلاح قبول کرنے سے پہلے توجہ اور محبت چاہتے ہیں۔",
                    better_alternative="Start with: 'I see you are really upset right now. I am right here with you.'" if not is_urdu else "یوں کہیں: 'میں دیکھ رہا ہوں کہ آپ غصے میں ہیں، میں آپ کے ساتھ ہوں۔'"
                ))

            did_well = raw.get("what_parent_did_well") or [
                "Kept communication open throughout the situation",
                "Did not abandon the conversation"
            ]

            recs = raw.get("key_recommendations") or [
                "Always label the feeling before enforcing the limit",
                "Lower your vocal volume when the child raises theirs",
                "Offer two acceptable choices to restore the child's feeling of control"
            ]

            trajectory = raw.get("emotional_trajectory") or "High initial friction transitioning to gradual calm"

            return PracticeDebriefResponse(
                overall_score=score,
                summary=summary,
                parent_wrong_behaviors=wrong_behaviors,
                what_parent_did_well=did_well,
                key_recommendations=recs,
                emotional_trajectory=trajectory,
                scenario_completed=True
            )

        except Exception as e:
            logger.error(f"[ParentPractice] Error generating debrief: {e}")
            return PracticeDebriefResponse(
                overall_score=75,
                summary=f"Completed practice for {req.scenario_title}. You stayed engaged and practiced responding under pressure.",
                parent_wrong_behaviors=[
                    FeedbackItem(
                        parent_utterance="Reaction to defiance",
                        what_went_wrong="Attempted to reason while child was in emotional brain (fight/flight).",
                        why_it_escalated="A dysregulated child cannot process logic until their nervous system feels safe.",
                        better_alternative="Pause, take a deep breath together, and validate their emotion first."
                    )
                ],
                what_parent_did_well=[
                    "Maintained dialogue instead of shutting down",
                    "Practiced emotional boundary setting"
                ],
                key_recommendations=[
                    "Connect before you correct: validate first, set the limit second",
                    "Keep your own voice slow and grounded",
                    "Praise small de-escalations immediately"
                ],
                emotional_trajectory="Initial tension with constructive learning",
                scenario_completed=True
            )


parent_practice_service = ParentPracticeService()
