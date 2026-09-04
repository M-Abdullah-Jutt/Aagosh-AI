from typing import List
from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_user
from app.models.user import User
from app.knowledge.schemas import SearchRequest, SearchResult, IngestionSummary
from app.knowledge.retrieval import KnowledgeRetrievalService
from app.knowledge.ingest import run_ingestion

router = APIRouter()


@router.post(
    "/search",
    response_model=List[SearchResult],
    status_code=status.HTTP_200_OK,
    summary="Search Parenting Knowledge Base for source-grounded protocols"
)
def search_knowledge(
    request: SearchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Source-grounded knowledge retrieval.
    Returns Top-K relevant parenting protocol chunks with similarity scores and page traceability.
    Does NOT invoke LLMs or generate dynamic advice.
    """
    filters = {}
    if request.age is not None:
        filters["age"] = request.age
    if request.category:
        filters["category"] = request.category
    if request.tags:
        filters["tags"] = request.tags

    return KnowledgeRetrievalService.retrieve(
        query=request.query,
        filters=filters if filters else None,
        top_k=request.top_k
    )


@router.post(
    "/ingest",
    response_model=IngestionSummary,
    status_code=status.HTTP_200_OK,
    summary="Trigger Knowledge Base Ingestion Pipeline (Idempotent)"
)
def trigger_ingestion(
    current_user: User = Depends(get_current_user)
):
    """
    Triggers idempotent PDF Knowledge Base ingestion.
    """
    return run_ingestion()
