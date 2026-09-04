from typing import List, Optional, Dict, Any
from app.knowledge.embeddings import get_embedding_provider
from app.knowledge.vector_store import FileVectorStore
from app.knowledge.schemas import SearchResult


class KnowledgeRetrievalService:
    @staticmethod
    def retrieve(
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[SearchResult]:
        """
        Retrieves top-K source-grounded knowledge chunks for a query.
        Supports metadata filtering (age, category, tags).
        Zero LLM calls or dynamic advice generation.
        """
        if not query or not query.strip():
            return []

        provider = get_embedding_provider()
        query_embedding = provider.embed_text(query)

        vector_store = FileVectorStore()
        results = vector_store.search(
            query_embedding=query_embedding,
            query_text=query,
            filters=filters,
            top_k=top_k
        )
        return results
