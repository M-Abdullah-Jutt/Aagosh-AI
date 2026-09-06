import re
import logging
from typing import Dict, Any, List, Tuple
from app.schemas.coach_schemas import SourceReference

logger = logging.getLogger(__name__)

# Forbidden clinical labels & diagnostic terms.
# English entries use word boundaries; Urdu entries are plain substrings because
# \b is unreliable against Urdu script runs.
FORBIDDEN_DIAGNOSTIC_TERMS = [
    r"\bADHD\b",
    r"\bADD\b",
    r"\bAutism\b",
    r"\bASD\b",
    r"\bemotional regulation disorder\b",
    r"\boppositional defiant disorder\b",
    r"\bODD\b",
    r"\bconduct disorder\b",
    r"\bpathological\b",
    r"\bpsychiatric\b",
    r"\bclinical diagnosis\b",
    r"\bpersonality disorder\b",
    r"\bbipolar\b",
    r"\bdepression\b",
    # Urdu-script equivalents
    "آٹزم",
    "ای ڈی ایچ ڈی",
    "ڈپریشن",
    "نفسیاتی عارضہ",
    "نفسیاتی تشخیص",
    "کلینیکل تشخیص",
    "شخصیت کا عارضہ",
    "بائی پولر",
    "ذہنی عارضہ",
    "دماغی بیماری",
    "اضطرابی عارضہ",
    "اپوزیشنل ڈیفائینٹ",
]

# Unsupported causal claims patterns
FORBIDDEN_CAUSAL_PATTERNS = [
    r"behavior is caused by",
    r"causing (your|the) child's behavior",
    r"is causing your child's behavior",
    r"suffers from emotional regulation",
    r"suffers from a disorder",
    r"due to an emotional disorder",
    # Urdu-script equivalents
    "رویے کی وجہ یہ عارضہ ہے",
    "بچے کے رویے کی بنیادی وجہ بیماری",
    "اس عارضے کی وجہ سے رویہ",
    "ذہنی عارضے کا شکار ہے",
]

# Dangerous or inappropriate parenting instructions
FORBIDDEN_HARMFUL_PATTERNS = [
    r"\bspank\b",
    r"\bslap\b",
    r"\bhit\b",
    r"\block (them|the child|your child) in a room\b",
    r"\bwithhold food\b",
    r"\bcorporal punishment\b",
    # Urdu-script equivalents
    "تھپڑ مار",
    "پٹائی کر",
    "ڈنڈے سے مار",
    "جسمانی سزا",
    "کمرے میں بند کر",
    "کھانا دینے سے محروم",
    "مار پیٹ",
]


class SafetyValidationError(Exception):
    """Raised when a generated response fails safety or grounding validation."""
    pass


class ParentingSafetyValidator:
    """
    Deterministic safety and grounding validation layer for LLM-generated responses.
    """

    @staticmethod
    def validate_response(
        raw_output: Dict[str, Any],
        retrieved_knowledge: List[Dict[str, Any]]
    ) -> Tuple[bool, List[str]]:
        """
        Validates the generated response for prohibited diagnostic, causal, or harmful content.
        Returns (is_valid, list_of_violations).
        """
        violations = []
        answer = raw_output.get("answer", "")
        key_points = raw_output.get("key_points", [])
        suggested_steps = raw_output.get("suggested_steps", [])

        full_text = f"{answer} " + " ".join(key_points) + " " + " ".join(suggested_steps)

        # 1. Check for clinical diagnosis claims
        for pattern in FORBIDDEN_DIAGNOSTIC_TERMS:
            if re.search(pattern, full_text, re.IGNORECASE):
                msg = f"Response contains prohibited diagnostic/clinical label matching: '{pattern}'"
                logger.warning(f"[Safety Validation Failure] {msg}")
                violations.append(msg)

        # 2. Check for unsupported causal claims
        for pattern in FORBIDDEN_CAUSAL_PATTERNS:
            if re.search(pattern, full_text, re.IGNORECASE):
                msg = f"Response contains unsupported causal claim matching: '{pattern}'"
                logger.warning(f"[Safety Validation Failure] {msg}")
                violations.append(msg)

        # 3. Check for dangerous parenting practices
        for pattern in FORBIDDEN_HARMFUL_PATTERNS:
            if re.search(pattern, full_text, re.IGNORECASE):
                msg = f"Response contains harmful/inappropriate instruction matching: '{pattern}'"
                logger.warning(f"[Safety Validation Failure] {msg}")
                violations.append(msg)

        is_valid = len(violations) == 0
        return is_valid, violations

    @staticmethod
    def generate_programmatic_citations(retrieved_knowledge: List[Dict[str, Any]]) -> List[SourceReference]:
        """
        Generates trusted source references programmatically directly from the retrieved RAG chunks,
        ensuring the LLM cannot hallucinate sources.
        """
        sources = []
        seen = set()

        for chunk in retrieved_knowledge:
            meta = chunk.get("metadata", {})
            src = meta.get("source", "Parenting Knowledge Base")
            page = meta.get("page")
            category = meta.get("category")

            key = (src, page, category)
            if key not in seen:
                seen.add(key)
                sources.append(SourceReference(
                    source=src,
                    page=page,
                    category=category
                ))

        return sources

    @staticmethod
    def validate_source_references(
        llm_references: List[SourceReference],
        retrieved_knowledge: List[Dict[str, Any]]
    ) -> bool:
        """
        Verifies that all source references returned by an LLM exist within the retrieved knowledge chunks.
        """
        retrieved_sources = {
            (chunk.get("metadata", {}).get("source"), chunk.get("metadata", {}).get("page"))
            for chunk in retrieved_knowledge
        }

        for ref in llm_references:
            # Check if source exists in retrieved set
            match = False
            for (r_src, r_page) in retrieved_sources:
                if ref.source == r_src and (ref.page is None or ref.page == r_page):
                    match = True
                    break
            if not match:
                logger.warning(f"[Source Validation Failure] LLM referenced un-retrieved source: {ref.source} page {ref.page}")
                return False

        return True
