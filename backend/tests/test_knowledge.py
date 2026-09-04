import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.knowledge.parser import PDFKnowledgeParser
from app.knowledge.embeddings import LocalTFIDFEmbeddingProvider, OpenAIEmbeddingProvider, get_embedding_provider
from app.knowledge.vector_store import FileVectorStore
from app.knowledge.retrieval import KnowledgeRetrievalService
from app.knowledge.ingest import run_ingestion
from app.models.user import User
from app.db.session import SessionLocal
from app.core.security import hash_password, create_access_token

client = TestClient(app)
PDF_PATH = r"E:\Agentic AI Projects\Aagosh AI\Data\Parentingpdf.pdf"


@pytest.fixture
def auth_header():
    db = SessionLocal()
    db.query(User).filter(User.email == "knowledge_test@test.com").delete()
    db.commit()

    user = User(
        full_name="Knowledge Tester",
        email="knowledge_test@test.com",
        password_hash=hash_password("Password123!"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_pdf_loading_and_parsing():
    doc, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    assert doc.source_name == "Parentingpdf.pdf"
    assert len(chunks) == 9


def test_document_metadata_extraction():
    doc, _ = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    assert doc.title == "Comprehensive CDC Positive Parenting Protocols"
    assert doc.source_type == "pdf"
    assert doc.status == "active"


def test_semantic_chunk_creation():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    for chunk in chunks:
        assert chunk.content != ""
        assert chunk.category != ""
        assert len(chunk.tags) > 0
        assert chunk.situation != ""
        assert chunk.parent_response != ""


def test_age_metadata():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    categories = {c.category for c in chunks}
    assert "Infants (0-1 Year)" in categories
    assert "Toddlers (1-3 Years)" in categories
    assert "Preschoolers (3-5 Years)" in categories
    assert "School-Age Children (6-14 Years)" in categories
    assert "Adolescence (15+ Years)" in categories

    infant_chunk = next(c for c in chunks if "Infants" in c.category)
    assert infant_chunk.age_min == 0
    assert infant_chunk.age_max == 1


def test_category_metadata():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    toddler_chunks = [c for c in chunks if "Toddler" in c.category]
    assert len(toddler_chunks) == 2


def test_tag_extraction():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    all_tags = set()
    for c in chunks:
        all_tags.update(c.tags)
    assert "tantrums" in all_tags
    assert "crying" in all_tags
    assert "homework" in all_tags
    assert "curfew" in all_tags


def test_source_page_traceability():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    pages = {c.source_metadata.page_number for c in chunks}
    assert pages == {1, 2, 3}


def test_chunk_ordering():
    _, chunks = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    indices = [c.chunk_index for c in chunks]
    assert indices == list(range(9))


def test_stable_chunk_ids():
    _, chunks1 = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    _, chunks2 = PDFKnowledgeParser.parse_pdf(PDF_PATH)
    for c1, c2 in zip(chunks1, chunks2):
        assert c1.id == c2.id


def test_idempotent_ingestion():
    summary1 = run_ingestion(PDF_PATH)
    assert summary1.status == "SUCCESS"

    summary2 = run_ingestion(PDF_PATH)
    assert summary2.status == "SUCCESS"
    assert summary2.duplicates_skipped == 9
    assert summary2.stored_chunks == 0


def test_embedding_provider_abstraction():
    provider = get_embedding_provider()
    vec = provider.embed_text("Sample query text")
    assert isinstance(vec, list)
    assert len(vec) > 0


def test_vector_store_abstraction():
    vector_store = FileVectorStore()
    health = vector_store.health_check()
    assert health["status"] == "healthy"
    assert health["total_chunks"] >= 9


def test_retrieval_returns_top_k():
    results = KnowledgeRetrievalService.retrieve(query="crying baby", top_k=3)
    assert len(results) <= 3
    assert len(results) > 0


def test_metadata_returned_with_results():
    results = KnowledgeRetrievalService.retrieve(query="homework refusal", top_k=1)
    assert len(results) == 1
    res = results[0]
    assert res.source == "Parentingpdf.pdf"
    assert res.page in [1, 2, 3]
    assert res.category != ""
    assert isinstance(res.tags, list)
    assert res.score > 0.0


def test_age_filtering():
    results = KnowledgeRetrievalService.retrieve(query="tantrums", filters={"age": 2}, top_k=5)
    for res in results:
        assert res.age_min <= 2 <= res.age_max


def test_category_filtering():
    results = KnowledgeRetrievalService.retrieve(query="safety", filters={"category": "Toddlers"}, top_k=5)
    for res in results:
        assert "Toddlers" in res.category


def test_tag_filtering():
    results = KnowledgeRetrievalService.retrieve(query="school", filters={"tags": ["homework"]}, top_k=5)
    for res in results:
        assert "homework" in [t.lower() for t in res.tags]


def test_empty_retrieval_result():
    results = KnowledgeRetrievalService.retrieve(query="")
    assert results == []


def test_retrieval_api_endpoint(auth_header):
    payload = {"query": "homework refusal", "age": 8, "top_k": 3}
    res = client.post("/api/v1/knowledge/search", json=payload, headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
