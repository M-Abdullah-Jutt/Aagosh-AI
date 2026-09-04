import os
import re
import json
import math
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.knowledge.schemas import KnowledgeChunk, SearchResult



class VectorStore(ABC):
    @abstractmethod
    def add_documents(self, chunks: List[KnowledgeChunk], embeddings: List[List[float]]) -> Dict[str, int]:
        """Store chunks and embeddings idempotently."""
        pass

    @abstractmethod
    def search(
        self,
        query_embedding: List[float],
        query_text: str = "",
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[SearchResult]:
        """Perform semantic search with metadata filtering."""
        pass

    @abstractmethod
    def delete(self, doc_id: Optional[str] = None) -> int:
        """Delete vectors by document ID or clear store."""
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Check vector store status and chunk count."""
        pass


class FileVectorStore(VectorStore):
    """
    JSON File-based vector store implementation.
    Completely isolated from the SQL Server application database.
    Stores chunks, metadata, and embeddings at `backend/data/knowledge_store.json`.
    """
    def __init__(self, file_path: Optional[str] = None):
        if file_path is None:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            data_dir = os.path.join(backend_dir, "data")
            os.makedirs(data_dir, exist_ok=True)
            file_path = os.path.join(data_dir, "knowledge_store.json")

        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        dir_name = os.path.dirname(self.file_path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name, exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({"chunks": []}, f, indent=2)

    def _load_store(self) -> List[Dict[str, Any]]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("chunks", [])
        except Exception:
            return []

    def _save_store(self, chunks: List[Dict[str, Any]]):
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump({"chunks": chunks}, f, indent=2)

    def add_documents(self, chunks: List[KnowledgeChunk], embeddings: List[List[float]]) -> Dict[str, int]:
        stored_chunks = self._load_store()
        existing_ids = {item["chunk"]["id"] for item in stored_chunks}

        added_count = 0
        skipped_count = 0

        for chunk, emb in zip(chunks, embeddings):
            if chunk.id in existing_ids:
                skipped_count += 1
                continue

            entry = {
                "chunk": chunk.model_dump(mode="json"),
                "embedding": emb
            }
            stored_chunks.append(entry)
            existing_ids.add(chunk.id)
            added_count += 1

        self._save_store(stored_chunks)
        return {
            "stored": added_count,
            "duplicates_skipped": skipped_count,
            "total_in_store": len(stored_chunks)
        }

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return dot / (norm1 * norm2)

    def search(
        self,
        query_embedding: List[float],
        query_text: str = "",
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[SearchResult]:
        stored_items = self._load_store()
        if not stored_items:
            return []

        query_words = set(re.findall(r'\w+', query_text.lower())) if query_text else set()
        filters = filters or {}
        filter_age = filters.get("age")
        filter_cat = filters.get("category")
        filter_tags = filters.get("tags")

        stop_words = {"a", "an", "the", "and", "or", "to", "my", "your", "his", "her", "their", "is", "are", "was", "were"}
        meaningful_query_words = {w for w in query_words if w not in stop_words and len(w) > 1}

        results = []
        for item in stored_items:
            c = item["chunk"]
            emb = item["embedding"]

            # Metadata Filtering
            if filter_age is not None:
                age_val = int(filter_age)
                if not (c["age_min"] <= age_val <= c["age_max"]):
                    continue

            if filter_cat:
                if filter_cat.lower() not in c["category"].lower():
                    continue

            if filter_tags:
                chunk_tags = {t.lower() for t in c.get("tags", [])}
                req_tags = {t.lower() for t in filter_tags}
                if not req_tags.intersection(chunk_tags):
                    continue

            # Vector similarity score
            sim_score = self._cosine_similarity(query_embedding, emb)

            # Text/Keyword overlap boost for hybrid precision
            keyword_boost = 0.0
            if meaningful_query_words:
                content_words = set(re.findall(r'\w+', c["content"].lower()))
                tag_words = {t.lower() for t in c.get("tags", [])}
                overlap = len(meaningful_query_words.intersection(content_words | tag_words))
                keyword_boost = 0.1 * overlap

            final_score = min(1.0, round(sim_score + keyword_boost, 4))


            res = SearchResult(
                chunk_id=c["id"],
                content=c["content"],
                score=final_score,
                source=c["source_metadata"]["source_name"],
                page=c["source_metadata"]["page_number"],
                category=c["category"],
                tags=c["tags"],
                age_min=c["age_min"],
                age_max=c["age_max"],
                situation=c["situation"],
                parent_response=c["parent_response"]
            )
            results.append(res)

        # Sort descending by score
        results.sort(key=lambda r: r.score, reverse=True)
        return results[:top_k]

    def delete(self, doc_id: Optional[str] = None) -> int:
        stored_items = self._load_store()
        if doc_id is None:
            count = len(stored_items)
            self._save_store([])
            return count

        new_items = [item for item in stored_items if item["chunk"]["document_id"] != doc_id]
        removed_count = len(stored_items) - len(new_items)
        self._save_store(new_items)
        return removed_count

    def health_check(self) -> Dict[str, Any]:
        stored_items = self._load_store()
        return {
            "status": "healthy",
            "file_path": self.file_path,
            "total_chunks": len(stored_items)
        }
