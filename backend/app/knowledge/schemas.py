from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class KnowledgeDocument(BaseModel):
    id: str
    title: str
    source_name: str
    source_type: str = "pdf"
    source_reference: Optional[str] = None
    version: str = "1.0"
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SourceMetadata(BaseModel):
    source_name: str
    page_number: int


class KnowledgeChunk(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    category: str
    age_min: int
    age_max: int
    tags: List[str] = Field(default_factory=list)
    situation: str
    parent_response: str
    source_metadata: SourceMetadata
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SearchResult(BaseModel):
    chunk_id: str
    content: str
    score: float
    source: str
    page: int
    category: str
    tags: List[str]
    age_min: int
    age_max: int
    situation: str
    parent_response: str


class IngestionSummary(BaseModel):
    document_name: str
    pages_processed: int
    chunks_created: int
    embedded_chunks: int
    stored_chunks: int
    duplicates_skipped: int
    status: str
    message: str


class SearchRequest(BaseModel):
    query: str
    age: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    top_k: int = 5
