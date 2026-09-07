import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.core.config import settings
from groq import Groq

logger = logging.getLogger(__name__)


class LLMProviderException(Exception):
    """Base exception for LLM provider errors."""
    pass


class LLMTimeoutException(LLMProviderException):
    """Raised when LLM request times out."""
    pass


class LLMAuthenticationException(LLMProviderException):
    """Raised when API authentication fails."""
    pass


class LLMRateLimitException(LLMProviderException):
    """Raised when LLM provider rate limit is exceeded."""
    pass


class LLMProvider(ABC):
    """
    Abstract interface for LLM response generation providers.
    """

    @abstractmethod
    def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generates a structured dictionary response given prompts and context.

        `language` is the code the response values must be written in. Network
        providers receive it implicitly via the system prompt directive; offline
        providers use it to select localized canned content.
        """
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass


class MockLLMProvider(LLMProvider):
    """
    Deterministic mock provider for offline testing and local development.
    Does not require external network access or paid API keys.
    """

    def __init__(self, model_name: str = "mock-model"):
        self._model_name = model_name

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def model_name(self) -> str:
        return self._model_name

    def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        logger.info(f"[MockLLMProvider] Generating response for prompt (language={language})")

        # Check for test control flags in prompt/message
        if "mock_timeout" in user_prompt:
            raise LLMTimeoutException("Mock provider simulated timeout")
        if "mock_rate_limit" in user_prompt:
            raise LLMRateLimitException("Mock provider simulated rate limit")
        if "mock_auth_error" in user_prompt:
            raise LLMAuthenticationException("Mock provider simulated authentication error")
        if "mock_provider_error" in user_prompt:
            raise LLMProviderException("Mock provider simulated generic error")
        if "mock_malformed" in user_prompt:
            return {"raw_text": "Not valid JSON output"}
        if "mock_diagnosis" in user_prompt:
            return {
                "answer": "Your child has an emotional regulation disorder and ADHD.",
                "key_points": ["Diagnosis confirmed"],
                "suggested_steps": ["Seek medication"]
            }
        if "mock_causal" in user_prompt:
            return {
                "answer": "Transitions are causing your child's behavior and poor emotional regulation.",
                "key_points": ["Transitions cause behavior"],
                "suggested_steps": ["Avoid transitions"]
            }

        knowledge = context.get("retrieved_knowledge", [])
        analytics = context.get("analytics", {})
        is_urdu = str(language).lower().startswith("ur")

        # Scenario 1: No knowledge available
        if not knowledge:
            if is_urdu:
                return {
                    "answer": "اس مخصوص صورتحال کے لیے موجودہ پیرنٹنگ نالج بیس میں میرے پاس کافی متعلقہ رہنمائی موجود نہیں ہے۔",
                    "key_points": ["اس سوال کے لیے نالج بیس میں کوئی براہِ راست رہنمائی نہیں ملی۔"],
                    "suggested_steps": ["عمومی اور عمر کے مطابق رہنمائی دیکھیں یا بعد میں دوبارہ کوشش کریں۔"]
                }
            return {
                "answer": "I don't have sufficiently relevant guidance in the current parenting knowledge base for this specific situation.",
                "key_points": ["No direct Knowledge Base protocols found for this inquiry."],
                "suggested_steps": ["Consult general age-appropriate guidance or check back later."]
            }

        # Scenario 2: Insufficient analytics data
        insufficient_prefix = ""
        if analytics.get("insufficient_data"):
            if is_urdu:
                insufficient_prefix = (
                    "مستقل مزاجی کا کوئی واضح نمونہ پہچاننے کے لیے ابھی کافی مشاہدات ریکارڈ نہیں ہوئے۔ "
                    "دستیاب پیرنٹنگ رہنمائی کی بنیاد پر آپ منظم انداز میں منتقلی کا طریقہ آزما سکتے ہیں۔ "
                )
            else:
                insufficient_prefix = "There aren't enough recorded observations yet to identify a consistent pattern. Based on the parenting guidance available for this situation, you could try using structured transitions. "

        if is_urdu:
            answer_text = (
                f"{insufficient_prefix}منتقلی کے چیلنجز سے نمٹتے وقت پیرنٹنگ رہنمائی یہ تجویز کرتی ہے کہ "
                "بچے کے جذبات کو تسلیم کیا جائے اور ساتھ ہی حد کو واضح طور پر برقرار رکھتے ہوئے "
                "محدود انتخاب پیش کیا جائے۔"
            )
            key_points = [
                "حد نافذ کرنے سے پہلے بچے کے جذبے کو تسلیم کریں۔",
                "بچے کو خود مختاری کا احساس دلانے کے لیے دو واضح اختیارات دیں۔",
                "مہربانی اور مضبوطی کے ساتھ مسلسل ایک ہی موقف پر قائم رہیں۔"
            ]
            suggested_steps = [
                "جذبے کو تسلیم کریں: توثیق کرنے سے جذبات کی شدت کم ہوتی ہے۔",
                "حد برقرار رکھیں: سرحد کو پیش گوئی کے قابل انداز میں قائم رکھیں۔",
                "محدود انتخاب دیں: مثلاً 'کیا تم گاڑی تک چل کر جانا چاہو گے یا چھلانگ لگا کر؟'",
                "عمل کروائیں: خود پرسکون رہیں اور منتقلی مکمل کروائیں۔"
            ]
        else:
            # Extract content from knowledge base chunks to form response
            answer_text = (
                f"{insufficient_prefix}When dealing with transition challenges, Parenting Base guidance recommends "
                "acknowledging the child's emotions while clearly holding the limit and offering limited choice."
            )
            key_points = [
                "Acknowledge the child's feeling before enforcing the limit.",
                "Offer 2 clear options to give the child a sense of autonomy.",
                "Consistently follow through with kindness and firmness."
            ]
            suggested_steps = [
                "Acknowledge Emotion: Validation helps de-escalate emotional intensity.",
                "Hold the Limit: Maintain the boundary predictably.",
                "Offer Limited Choice: Give choices like 'Do you want to walk or hop to the car?'",
                "Follow Through: Stay calm and carry out the transition."
            ]

        return {
            "answer": answer_text,
            "key_points": key_points,
            "suggested_steps": suggested_steps
        }


class OpenAILLMProvider(LLMProvider):
    """
    OpenAI LLM provider integration using HTTP client / official SDK if configured.
    """

    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self._model_name = model_name or settings.LLM_MODEL

        if not self.api_key:
            logger.warning("OpenAILLMProvider initialized without an API key.")

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model_name

    def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise LLMAuthenticationException("OpenAI API key is missing. Set LLM_API_KEY environment variable.")

        try:
            import urllib.request
            import urllib.error

            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }

            payload = {
                "model": self._model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": settings.LLM_TEMPERATURE,
                "max_tokens": settings.LLM_MAX_TOKENS,
                "response_format": {"type": "json_object"}
            }

            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                content_str = res_body["choices"][0]["message"]["content"]
                return json.loads(content_str)

        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise LLMAuthenticationException(f"OpenAI Authentication Failed: HTTP {e.code}")
            elif e.code == 429:
                raise LLMRateLimitException(f"OpenAI Rate Limit Exceeded: HTTP {e.code}")
            else:
                raise LLMProviderException(f"OpenAI API Error: HTTP {e.code}")
        except urllib.error.URLError as e:
            raise LLMTimeoutException(f"OpenAI Connection Failed/Timed Out: {e}")
        except json.JSONDecodeError as e:
            raise LLMProviderException(f"Failed to parse JSON response from OpenAI: {e}")
        except Exception as e:
            raise LLMProviderException(f"Unexpected OpenAI Provider Error: {e}")


class GeminiLLMProvider(LLMProvider):
    """
    Google Gemini LLM provider integration using the Gemini REST API.
    Requires LLM_API_KEY set to a valid Gemini API key.
    Defaults to gemini-2.5-flash model for cost efficiency.
    """

    GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self._model_name = model_name or getattr(settings, "LLM_MODEL", "gemini-2.5-flash")

        if not self.api_key:
            logger.warning("GeminiLLMProvider initialized without an API key.")

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model_name

    def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise LLMAuthenticationException("Gemini API key is missing. Set LLM_API_KEY environment variable.")

        try:
            import urllib.request
            import urllib.error

            url = f"{self.GEMINI_API_BASE}/{self._model_name}:generateContent?key={self.api_key}"

            # Use Gemini's systemInstruction field for proper system prompting
            system_instruction_text = (
                f"{system_prompt}\n\n"
                f"IMPORTANT: You MUST respond with a valid JSON object only. "
                f"The JSON must have exactly these keys: \"answer\", \"key_points\" (list of strings), "
                f"\"suggested_steps\" (list of strings). The language of every string VALUE is controlled "
                f"by the RESPONSE LANGUAGE section above and MUST be followed exactly."
            )

            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_instruction_text}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": getattr(settings, "LLM_TEMPERATURE", 0.2),
                    "maxOutputTokens": getattr(settings, "LLM_MAX_TOKENS", 1000),
                    "responseMimeType": "application/json"
                }
            }

            headers = {"Content-Type": "application/json"}
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=45) as response:
                res_body = json.loads(response.read().decode("utf-8"))

            # Extract generated text from Gemini response
            candidates = res_body.get("candidates", [])
            if not candidates:
                raise LLMProviderException("Gemini returned no candidates in response.")

            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts:
                raise LLMProviderException("Gemini response content parts are empty.")

            raw_text = content_parts[0].get("text", "").strip()

            # Strip markdown fences if present (defensive)
            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                raw_text = "\n".join(
                    line for line in lines
                    if not line.strip().startswith("```")
                ).strip()

            parsed = json.loads(raw_text)
            logger.info(f"[GeminiLLMProvider] Successfully parsed structured response from {self._model_name}")
            return parsed

        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise LLMAuthenticationException(f"Gemini Authentication Failed: HTTP {e.code}")
            elif e.code == 429:
                raise LLMRateLimitException(f"Gemini Rate Limit Exceeded: HTTP {e.code}")
            else:
                error_body = ""
                try:
                    error_body = e.read().decode("utf-8")
                except Exception:
                    pass
                raise LLMProviderException(f"Gemini API Error: HTTP {e.code} — {error_body}")
        except urllib.error.URLError as e:
            raise LLMTimeoutException(f"Gemini Connection Failed/Timed Out: {e}")
        except json.JSONDecodeError as e:
            raise LLMProviderException(f"Failed to parse JSON response from Gemini: {e}")
        except (LLMAuthenticationException, LLMRateLimitException, LLMTimeoutException, LLMProviderException):
            raise
        except Exception as e:
            raise LLMProviderException(f"Unexpected Gemini Provider Error: {e}")


class GroqLLMProvider(LLMProvider):
    """
    Groq LLM provider integration.
    """

    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self._model_name = model_name or "openai/gpt-oss-120b"

        if not self.api_key:
            logger.warning("GroqLLMProvider initialized without an API key.")

    @property
    def provider_name(self) -> str:
        return "groq"

    @property
    def model_name(self) -> str:
        return self._model_name

    def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise LLMAuthenticationException("Groq API key is missing. Set LLM_API_KEY environment variable.")

        try:
            
            # Initialize client with explicitly provided API key
            client = Groq(api_key=self.api_key)
            
            system_instruction_text = (
                f"{system_prompt}\n\n"
                f"IMPORTANT: You MUST respond with a valid JSON object only. "
                f"The JSON must have exactly these keys: \"answer\", \"key_points\" (list of strings), "
                f"\"suggested_steps\" (list of strings). The language of every string VALUE is controlled "
                f"by the RESPONSE LANGUAGE section above and MUST be followed exactly."
            )

            # We set stream=False here because the existing architecture expects 
            # a complete parsed dictionary in return, not an HTTP stream chunk.
            completion = client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system_instruction_text},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=1,
                max_completion_tokens=2048,
                top_p=1,
                reasoning_effort="medium",
                stream=False,
                response_format={"type": "json_object"},
                stop=None
            )

            content_str = completion.choices[0].message.content
            
            # Strip markdown fences if present (defensive)
            if content_str.strip().startswith("```"):
                lines = content_str.strip().splitlines()
                content_str = "\n".join(
                    line for line in lines
                    if not line.strip().startswith("```")
                ).strip()
                
            parsed = json.loads(content_str)
            logger.info(f"[GroqLLMProvider] Successfully parsed structured response from {self._model_name}")
            return parsed

        except Exception as e:
            raise LLMProviderException(f"Unexpected Groq Provider Error: {e}")


def get_llm_provider() -> LLMProvider:
    """
    Factory function returning the configured LLMProvider based on LLM_PROVIDER setting.
    Supported values: 'gemini', 'openai', 'groq', or anything else falls back to MockLLMProvider.
    """
    provider_type = settings.LLM_PROVIDER.lower().strip()
    if provider_type == "groq" and settings.LLM_API_KEY:
        return GroqLLMProvider()
    if provider_type == "gemini" and settings.LLM_API_KEY:
        return GeminiLLMProvider()
    if provider_type == "openai" and settings.LLM_API_KEY:
        return OpenAILLMProvider()
    logger.warning(f"[LLMProvider] Using MockLLMProvider. Set LLM_PROVIDER and LLM_API_KEY in .env to use a real provider.")
    return MockLLMProvider()
