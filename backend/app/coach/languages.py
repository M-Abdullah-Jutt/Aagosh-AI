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
        "greeting": "Hi there! 👋 I'm Aaghosh AI — your personal, evidence-informed parenting companion.",
        "welcome_support": (
            "I've carefully reviewed everything you've shared about {child_name} ({age}), "
            "and I'm ready to support you every step of the way. Whether you're navigating "
            "big emotions, tricky bedtime routines, screen-time battles, sibling conflicts, or "
            "just need a thoughtful parenting perspective — I'm here to help, grounded in "
            "real, approved parenting guidance."
        ),
        "welcome_strengths": " I noticed you've highlighted some of {child_name}'s strengths: {text} — that's wonderful context!",
        "welcome_challenges": " You've also shared some areas you'd like to work on together: {text}.",
        "welcome_goals": " Your current parenting focus areas are: **{goals}**.",
        "welcome_ask": (
            "To give you the most personalised guidance, I'd love to hear what's been on your mind lately. "
            "What's a situation with {child_name} that you'd most like support with right now? "
            "It could be something that happened today, a recurring pattern, or simply a question "
            "you've been wondering about."
        ),
        "welcome_invite": (
            "Feel free to type anything — a question, a quick update, or even just how your day went. "
            "I'm here, and I'm listening. 💚"
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
        "greeting": "السلام علیکم! 👋 میں آغوش اے آئی ہوں — آپ کا ذاتی، شواہد پر مبنی پیرنٹنگ ساتھی۔",
        "welcome_support": (
            "میں نے {child_name} ({age}) کے بارے میں آپ کی فراہم کردہ تمام معلومات کا بغور جائزہ لیا ہے "
            "اور میں ہر قدم پر آپ کی مدد کے لیے پوری طرح تیار ہوں۔ چاہے آپ بڑے جذبات، سونے کے مشکل معمولات، "
            "اسکرین ٹائم کے مسائل، بہن بھائیوں کے درمیان جھگڑوں سے نمٹ رہے ہوں، یا بس ایک سوچے سمجھے "
            "پیرنٹنگ نقطہ نظر کی ضرورت ہو — میں منظور شدہ پیرنٹنگ رہنمائی کی بنیاد پر آپ کی مدد کے لیے حاضر ہوں۔"
        ),
        "welcome_strengths": " میں نے دیکھا کہ آپ نے {child_name} کی چند خوبیاں اجاگر کی ہیں: {text} — یہ بہت اچھا تناظر ہے!",
        "welcome_challenges": " آپ نے کچھ ایسے پہلو بھی بیان کیے ہیں جن پر مل کر کام کرنا ہے: {text}۔",
        "welcome_goals": " آپ کے موجودہ پیرنٹنگ توجہ کے شعبے یہ ہیں: **{goals}**۔",
        "welcome_ask": (
            "آپ کو سب سے بہتر، ذاتی رہنمائی دینے کے لیے میں جاننا چاہوں گا کہ آج کل آپ کے ذہن میں کیا چل رہا ہے۔ "
            "ایسی کونسی صورتحال ہے {child_name} کے ساتھ جس میں آپ ابھی سب سے زیادہ مدد چاہتے ہیں؟ "
            "یہ آج کا کوئی واقعہ ہو سکتا ہے، کوئی بار بار آنے والا معاملہ، یا بس کوئی سوال جو آپ کے ذہن میں ہو۔"
        ),
        "welcome_invite": (
            "بے جھجھک کچھ بھی لکھیں — کوئی سوال، ایک مختصر اپ ڈیٹ، یا یہاں تک کہ بس آپ کا دن کیسا گزرا۔ "
            "میں یہاں ہوں، اور میں توجہ سے سن رہا ہوں۔ 💚"
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
