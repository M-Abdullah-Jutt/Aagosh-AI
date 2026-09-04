import os
import math
import re
from abc import ABC, abstractmethod
from typing import List, Dict


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Embed a single query or text string into a vector."""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of document texts into vectors."""
        pass


class LocalTFIDFEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic local TF-IDF / Subword embedding provider.
    Zero external dependencies or API keys required.
    Converts text into normalized feature vectors for cosine similarity.
    """
    STOP_WORDS = {
        "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", "while",
        "of", "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "down", "in",
        "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
        "there", "when", "where", "why", "how", "all", "any", "both", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don",
        "should", "now", "my", "your", "his", "her", "its", "their", "is", "are", "was",
        "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
    }

    def __init__(self, vector_dim: int = 512):
        self.vector_dim = vector_dim

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\w+', text.lower())
        meaningful_words = [w for w in words if w not in self.STOP_WORDS and len(w) > 1]
        
        tokens = list(meaningful_words)
        # Add word bigrams for semantic context
        for i in range(len(meaningful_words) - 1):
            tokens.append(f"{meaningful_words[i]}_{meaningful_words[i+1]}")
            
        return tokens if tokens else words

    def _hash_token(self, token: str) -> int:
        """Hash token deterministically into vector index."""
        h = 0
        for char in token:
            h = (h * 31 + ord(char)) & 0xFFFFFFFF
        return h % self.vector_dim

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.vector_dim

        vec = [0.0] * self.vector_dim
        for tok in tokens:
            idx = self._hash_token(tok)
            vec[idx] += 1.0

        # L2 Normalize
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec


    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """
    OpenAI embedding provider using API embeddings (text-embedding-3-small).
    Falls back to LocalTFIDFEmbeddingProvider if API key is absent or request fails.
    """
    def __init__(self, api_key: str = None, model_name: str = "text-embedding-3-small"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model_name = os.getenv("EMBEDDING_MODEL", model_name)
        self.fallback = LocalTFIDFEmbeddingProvider()

    def embed_text(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.embed_text(text)
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "input": text,
                "model": self.model_name
            }
            res = httpx.post("https://api.openai.com/v1/embeddings", json=payload, headers=headers, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                return data["data"][0]["embedding"]
            else:
                return self.fallback.embed_text(text)
        except Exception:
            return self.fallback.embed_text(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            return self.fallback.embed_documents(texts)
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "input": texts,
                "model": self.model_name
            }
            res = httpx.post("https://api.openai.com/v1/embeddings", json=payload, headers=headers, timeout=15.0)
            if res.status_code == 200:
                data = res.json()
                return [item["embedding"] for item in data["data"]]
            else:
                return self.fallback.embed_documents(texts)
        except Exception:
            return self.fallback.embed_documents(texts)


def get_embedding_provider() -> EmbeddingProvider:
    provider_type = os.getenv("EMBEDDING_PROVIDER", "local").lower()
    if provider_type == "openai" and os.getenv("OPENAI_API_KEY"):
        return OpenAIEmbeddingProvider()
    return LocalTFIDFEmbeddingProvider()
