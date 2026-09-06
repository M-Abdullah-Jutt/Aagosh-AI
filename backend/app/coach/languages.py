"""
Language support for the AI Parenting Coach.

Holds the supported language set, the directives injected into the LLM system
prompt, and the localized static strings the coach emits without calling the LLM
(welcome message, safety fallbacks, disclaimers).
"""

from typing import Optional

ENGLISH = "en"
URDU = "ur"

SUPPORTED_LANGUAGES = (ENGLISH, URDU)
DEFAULT_LANGUAGE = ENGLISH

LANGUAGE_DISPLAY_NAMES = {
    ENGLISH: "English",
    URDU: "Urdu",
}

# Injected as the final section of the system prompt. The JSON schema keys stay
# English (they are parsed programmatically); only the values are localized.
RESPONSE_LANGUAGE_DIRECTIVES = {
    ENGLISH: (
        "Write every value in your JSON output in clear, natural, parent-friendly English."
    ),
    URDU: (
        "Write every value in your JSON output in clear, natural Urdu using the Urdu "
        "Perso-Arabic script (اردو). Keep the JSON keys exactly as specified in English, "
        "but all string VALUES — including \"answer\", every item of \"key_points\", and "
        "every item of \"suggested_steps\" — MUST be written in Urdu script. Never "
        "transliterate Urdu into Latin characters and never answer in English. "
        "Retrieved knowledge sources are in English: read them in English, then explain "
        "their guidance to the parent in Urdu. Keep well-known English proper nouns "
        "(such as published program names) untranslated where no established Urdu term exists."
    ),
}

# Static strings emitted by the coach without an LLM call.
COACH_STRINGS = {
    ENGLISH: {
        "format_error": (
            "I'm sorry, I was unable to format the parenting response properly. "
            "Please try rephrasing your question."
        ),
        "safety_block_answer": (
            "I can offer general parenting guidance based on approved resources, but I cannot "
            "provide clinical diagnoses, psychiatric labels, or unsupported claims about "
            "behavioral causes."
        ),
        "safety_block_key_points": [
            "Focus on observable behaviors and positive routines."
        ],
        "safety_block_steps": [
            "Consult with your child's pediatrician or healthcare provider for clinical assessments."
        ],
        "no_relevant_knowledge": (
            "I don't have sufficiently relevant guidance in the current parenting knowledge base "
            "for this specific situation."
        ),
        "disclaimer": (
            "This guidance is based on the parenting resources available in Aaghosh AI and is "
            "not a clinical diagnosis."
        ),
        "welcome_disclaimer": "Aaghosh AI is not a medical or clinical tool.",
        "new_conversation_title": "New Conversation",
        "greeting": "Hi! I'm Aaghosh AI, your personal parenting companion.",
        "welcome_support": (
            "I'm here to support you with evidence-informed guidance tailored to {child_name}, "
            "who is {age}."
        ),
        "welcome_strengths": " I can see you've noted some strengths for {child_name}: {text}."
        ,
        "welcome_challenges": " You've also mentioned some growth areas: {text}."
        ,
        "welcome_goals": " Your active parenting focus areas include: {goals}."
        ,
        "welcome_ask": (
            "To give you the most helpful guidance, I'd love to understand {child_name}'s daily "
            "patterns better. Could you tell me about any emotional triggers or challenging "
            "situations you've been observing lately? For example: transitions (ending screen "
            "time, bedtime), mealtimes, sibling interactions, or moments when strong emotions "
            "tend to arise."
        ),
        "welcome_invite": (
            "You can also ask me anything directly — about behavior, routines, communication, or "
            "anything on your mind as a parent. I'm here to help!"
        ),
        "age_years": "{years} years old",
        "age_unknown": "at their age",
        "child_fallback": "your child",
    },
    URDU: {
        "format_error": (
            "معاف کیجیے، میں پیرنٹنگ جواب کو درست شکل میں پیش نہیں کر سکا۔ "
            "براہ کرم اپنا سوال دوبارہ مختلف انداز میں پوچھیں۔"
        ),
        "safety_block_answer": (
            "میں منظور شدہ وسائل کی بنیاد پر عمومی پیرنٹنگ رہنمائی پیش کر سکتا ہوں، لیکن میں "
            "کلینیکل تشخیص، نفسیاتی لیبل، یا بچے کے رویے کی وجوہات کے بارے میں بے بنیاد دعوے "
            "فراہم نہیں کر سکتا۔"
        ),
        "safety_block_key_points": [
            "قابلِ مشاہدہ رویوں اور مثبت روزمرہ معمولات پر توجہ مرکوز کریں۔"
        ],
        "safety_block_steps": [
            "کلینیکل جائزے کے لیے اپنے بچے کے ماہرِ امراضِ اطفال یا معالج سے رجوع کریں۔"
        ],
        "no_relevant_knowledge": (
            "اس مخصوص صورتحال کے لیے موجودہ پیرنٹنگ نالج بیس میں میرے پاس کافی متعلقہ "
            "رہنمائی موجود نہیں ہے۔"
        ),
        "disclaimer": (
            "یہ رہنمائی آغوش اے آئی میں دستیاب پیرنٹنگ وسائل پر مبنی ہے اور یہ کسی قسم کی "
            "کلینیکل تشخیص نہیں ہے۔"
        ),
        "welcome_disclaimer": "آغوش اے آئی کوئی طبی یا کلینیکل ٹول نہیں ہے۔",
        "new_conversation_title": "نئی گفتگو",
        "greeting": "السلام علیکم! میں آغوش اے آئی ہوں، آپ کا ذاتی پیرنٹنگ ساتھی۔",
        "welcome_support": (
            "میں آپ کو {child_name} کے لیے شواہد پر مبنی رہنمائی فراہم کرنے کے لیے موجود ہوں، "
            "جن کی عمر {age} ہے۔"
        ),
        "welcome_strengths": " میں دیکھ سکتا ہوں کہ آپ نے {child_name} کی چند خوبیاں نوٹ کی ہیں: {text}۔",
        "welcome_challenges": " آپ نے کچھ ایسے پہلو بھی بیان کیے ہیں جن پر کام کی ضرورت ہے: {text}۔",
        "welcome_goals": " آپ کے فعال پیرنٹنگ مقاصد میں یہ شامل ہیں: {goals}۔",
        "welcome_ask": (
            "بہترین رہنمائی دینے کے لیے میں {child_name} کے روزمرہ معمولات کو بہتر طور پر سمجھنا "
            "چاہوں گا۔ کیا آپ مجھے حال ہی میں نظر آنے والے کسی جذباتی محرک یا مشکل صورتحال کے "
            "بارے میں بتا سکتے ہیں؟ مثال کے طور پر: ایک کام سے دوسرے کام کی منتقلی (اسکرین ٹائم "
            "ختم کرنا، سونے کا وقت)، کھانے کے اوقات، بہن بھائیوں کے ساتھ تعلقات، یا وہ لمحات جب "
            "بچے میں شدید جذبات ابھرتے ہیں۔"
        ),
        "welcome_invite": (
            "آپ مجھ سے براہِ راست بھی کچھ پوچھ سکتے ہیں — رویے، روزمرہ معمولات، بات چیت کے انداز، "
            "یا والدین کے طور پر آپ کے ذہن میں موجود کسی بھی بات کے بارے میں۔ میں آپ کی مدد کے "
            "لیے حاضر ہوں!"
        ),
        "age_years": "{years} سال",
        "age_unknown": "اپنی عمر کے مطابق",
        "child_fallback": "آپ کا بچہ",
    },
}

# Urdu labels for the fixed parenting-goal enum, used when the welcome message
# names a parent's active goals.
GOAL_TYPE_LABELS_URDU = {
    "emotional_regulation": "جذبات پر قابو",
    "screen_time": "اسکرین ٹائم",
    "sleep": "نیند کا معمول",
    "bedtime_routine": "سونے کا معمول",
    "tantrums": "ضد اور غصے کے دورے",
    "discipline": "نظم و ضبط",
    "communication": "بات چیت",
    "social_skills": "سماجی مہارتیں",
    "independence": "خود مختاری",
    "academic_support": "تعلیمی معاونت",
    "eating_habits": "کھانے کی عادات",
    "sibling_rivalry": "بہن بھائیوں کی چپقلش",
    "potty_training": "ٹوائلٹ ٹریننگ",
    "separation_anxiety": "علیحدگی کی پریشانی",
    "confidence": "اعتماد",
}


def normalize_language(value: Optional[str]) -> str:
    """Coerces any incoming language value to a supported language code."""
    if not value:
        return DEFAULT_LANGUAGE
    candidate = str(value).strip().lower()
    if candidate in SUPPORTED_LANGUAGES:
        return candidate
    # Accept common full names and locale tags such as "ur-PK".
    prefix = candidate.split("-")[0].split("_")[0]
    if prefix in SUPPORTED_LANGUAGES:
        return prefix
    if prefix in ("urdu", "اردو"):
        return URDU
    if prefix in ("english", "en-us", "en-gb"):
        return ENGLISH
    return DEFAULT_LANGUAGE


def get_strings(language: Optional[str]) -> dict:
    """Returns the localized static-string table for a language."""
    return COACH_STRINGS[normalize_language(language)]


def get_language_directive(language: Optional[str]) -> str:
    """Returns the system-prompt directive controlling LLM output language."""
    return RESPONSE_LANGUAGE_DIRECTIVES[normalize_language(language)]


def get_goal_type_label(goal_type: str, language: Optional[str]) -> str:
    """Human-readable goal label for the given language."""
    normalized_goal = (goal_type or "").strip()
    if normalize_language(language) == URDU:
        return GOAL_TYPE_LABELS_URDU.get(
            normalized_goal, normalized_goal.replace("_", " ")
        )
    return normalized_goal.replace("_", " ").title()
