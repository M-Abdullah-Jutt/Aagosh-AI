import os
import re
import json
import math
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.knowledge.schemas import KnowledgeChunk, SearchResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# ChromaDB Vector Store  (primary — uses ANN indexing + native metadata filter)
# ---------------------------------------------------------------------------

class ChromaVectorStore(VectorStore):
    """
    ChromaDB-backed persistent vector store.

    • Stores vectors under `backend/data/chroma_store/` by default.
    • Supports native metadata filtering (age_min / age_max / category / tags).
    • Uses cosine distance (chromadb default).
    • Falls back gracefully: if chromadb is unavailable the factory function
      returns FileVectorStore instead, so nothing breaks.
    """

    COLLECTION_NAME = "aaghosh_knowledge"

    def __init__(self, persist_dir: Optional[str] = None):
        import chromadb  # imported here so ImportError is caught by factory

        if persist_dir is None:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            persist_dir = os.getenv(
                "CHROMA_PERSIST_DIR",
                os.path.join(backend_dir, "data", "chroma_store")
            )

        os.makedirs(persist_dir, exist_ok=True)
        self.persist_dir = persist_dir

        self._client = chromadb.PersistentClient(path=persist_dir)
        self._col = self._client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(
            "[ChromaVectorStore] Initialized. persist_dir=%s | chunks=%d",
            persist_dir, self._col.count()
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _tags_to_str(tags: List[str]) -> str:
        """Encode tags list as a comma-separated string for Chroma metadata."""
        return ",".join(t.lower() for t in tags)

    @staticmethod
    def _str_to_tags(s: str) -> List[str]:
        return [t for t in s.split(",") if t]

    # ------------------------------------------------------------------
    # VectorStore interface
    # ------------------------------------------------------------------

    def add_documents(
        self,
        chunks: List[KnowledgeChunk],
        embeddings: List[List[float]]
    ) -> Dict[str, int]:
        if not chunks:
            return {"stored": 0, "duplicates_skipped": 0, "total_in_store": self._col.count()}

        # Fetch existing IDs in one call
        existing_result = self._col.get(include=[])
        existing_ids: set = set(existing_result["ids"])

        ids_to_add, embs_to_add, docs_to_add, metas_to_add = [], [], [], []
        skipped = 0

        for chunk, emb in zip(chunks, embeddings):
            if chunk.id in existing_ids:
                skipped += 1
                continue
            ids_to_add.append(chunk.id)
            embs_to_add.append(emb)
            docs_to_add.append(chunk.content)
            metas_to_add.append({
                "document_id":   chunk.document_id,
                "chunk_index":   chunk.chunk_index,
                "category":      chunk.category,
                "age_min":       chunk.age_min,
                "age_max":       chunk.age_max,
                "tags":          self._tags_to_str(chunk.tags),
                "situation":     chunk.situation,
                "parent_response": chunk.parent_response,
                "source_name":   chunk.source_metadata.source_name,
                "page_number":   chunk.source_metadata.page_number,
            })

        if ids_to_add:
            self._col.add(
                ids=ids_to_add,
                embeddings=embs_to_add,
                documents=docs_to_add,
                metadatas=metas_to_add
            )
            logger.info("[ChromaVectorStore] Added %d chunks, skipped %d duplicates.", len(ids_to_add), skipped)

        return {
            "stored": len(ids_to_add),
            "duplicates_skipped": skipped,
            "total_in_store": self._col.count()
        }

    def search(
        self,
        query_embedding: List[float],
        query_text: str = "",
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[SearchResult]:
        total = self._col.count()
        if total == 0:
            return []

        filters = filters or {}
        where: Optional[Dict[str, Any]] = None

        # Build Chroma 'where' clause for metadata filtering
        conditions: List[Dict[str, Any]] = []

        filter_age = filters.get("age")
        if filter_age is not None:
            age_val = int(filter_age)
            # chunk must satisfy: age_min <= age_val <= age_max
            conditions.append({"age_min": {"$lte": age_val}})
            conditions.append({"age_max": {"$gte": age_val}})

        filter_cat = filters.get("category")
        if filter_cat:
            conditions.append({"category": {"$eq": filter_cat.lower()}})

        if len(conditions) == 1:
            where = conditions[0]
        elif len(conditions) > 1:
            where = {"$and": conditions}

        n_results = min(top_k * 3, total)  # over-fetch then re-rank with keyword boost
        try:
            result = self._col.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            logger.warning("[ChromaVectorStore] Query failed: %s. Falling back to no-filter query.", e)
            result = self._col.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )

        ids       = result["ids"][0]
        docs      = result["documents"][0]
        metas     = result["metadatas"][0]
        distances = result["distances"][0]  # cosine distance ∈ [0, 2]; lower = more similar

        # Optional tag filtering (post-query, since Chroma can't do substring-in-list natively)
        filter_tags = filters.get("tags")
        req_tags = {t.lower() for t in filter_tags} if filter_tags else set()

        # Build keyword boost set
        stop_words = {
            "a", "an", "the", "and", "or", "to", "my", "your", "his", "her",
            "their", "is", "are", "was", "were"
        }
        query_words = set(re.findall(r'\w+', query_text.lower())) if query_text else set()
        meaningful_query_words = {w for w in query_words if w not in stop_words and len(w) > 1}

        search_results: List[SearchResult] = []
        for chunk_id, content, meta, dist in zip(ids, docs, metas, distances):
            # Tag post-filter
            if req_tags:
                chunk_tags = set(self._str_to_tags(meta.get("tags", "")))
                if not req_tags.intersection(chunk_tags):
                    continue

            # Convert cosine distance → similarity score ∈ [0, 1]
            # Chroma cosine distance: 0 = identical, 2 = opposite; typical range 0–1
            sim_score = max(0.0, 1.0 - (dist / 2.0))

            # Keyword boost
            keyword_boost = 0.0
            if meaningful_query_words:
                content_words = set(re.findall(r'\w+', content.lower()))
                tag_words = set(self._str_to_tags(meta.get("tags", "")))
                overlap = len(meaningful_query_words.intersection(content_words | tag_words))
                keyword_boost = min(0.15, 0.03 * overlap)

            final_score = min(1.0, round(sim_score + keyword_boost, 4))

            search_results.append(SearchResult(
                chunk_id=chunk_id,
                content=content,
                score=final_score,
                source=meta.get("source_name", ""),
                page=int(meta.get("page_number", 0)),
                category=meta.get("category", ""),
                tags=self._str_to_tags(meta.get("tags", "")),
                age_min=int(meta.get("age_min", 0)),
                age_max=int(meta.get("age_max", 18)),
                situation=meta.get("situation", ""),
                parent_response=meta.get("parent_response", "")
            ))

        search_results.sort(key=lambda r: r.score, reverse=True)
        return search_results[:top_k]

    def delete(self, doc_id: Optional[str] = None) -> int:
        if doc_id is None:
            count = self._col.count()
            self._col.delete(where={"document_id": {"$ne": ""}})
            logger.info("[ChromaVectorStore] Cleared entire collection (%d chunks).", count)
            return count

        # Fetch IDs belonging to this document_id
        result = self._col.get(where={"document_id": {"$eq": doc_id}}, include=[])
        ids_to_delete = result["ids"]
        if ids_to_delete:
            self._col.delete(ids=ids_to_delete)
            logger.info("[ChromaVectorStore] Deleted %d chunks for document_id=%s.", len(ids_to_delete), doc_id)
        return len(ids_to_delete)

    def health_check(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "backend": "chromadb",
            "persist_dir": self.persist_dir,
            "collection": self.COLLECTION_NAME,
            "total_chunks": self._col.count()
        }


# ---------------------------------------------------------------------------
# Legacy FileVectorStore  (JSON-based fallback when chromadb is not installed)
# ---------------------------------------------------------------------------

class FileVectorStore(VectorStore):
    """
    JSON File-based vector store implementation (legacy / fallback).
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

            sim_score = self._cosine_similarity(query_embedding, emb)

            keyword_boost = 0.0
            if meaningful_query_words:
                content_words = set(re.findall(r'\w+', c["content"].lower()))
                tag_words = {t.lower() for t in c.get("tags", [])}
                overlap = len(meaningful_query_words.intersection(content_words | tag_words))
                keyword_boost = 0.1 * overlap

            final_score = min(1.0, round(sim_score + keyword_boost, 4))

            results.append(SearchResult(
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
            ))

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
            "backend": "file",
            "file_path": self.file_path,
            "total_chunks": len(stored_items)
        }


# ---------------------------------------------------------------------------
# Factory function — selects the best available vector store
# ---------------------------------------------------------------------------

def get_vector_store() -> VectorStore:
    """
    Returns the configured vector store backend.

    Priority:
    1. If VECTOR_STORE=chroma and chromadb is installed → ChromaVectorStore
    2. If VECTOR_STORE=chroma but chromadb is NOT installed → warns and falls back
    3. If VECTOR_STORE=file (or anything else) → FileVectorStore
    """
    store_type = os.getenv("VECTOR_STORE", "chroma").lower()

    if store_type == "chroma":
        try:
            store = ChromaVectorStore()
            logger.info("[VectorStore] Using ChromaDB persistent vector store.")
            return store
        except ImportError:
            logger.warning(
                "[VectorStore] chromadb package is not installed. "
                "Falling back to FileVectorStore. "
                "Install it with: pip install chromadb"
            )
        except Exception as e:
            logger.warning(
                "[VectorStore] Failed to initialize ChromaVectorStore (%s). "
                "Falling back to FileVectorStore.", e
            )

    logger.info("[VectorStore] Using legacy FileVectorStore (JSON-based).")
    return FileVectorStore()
