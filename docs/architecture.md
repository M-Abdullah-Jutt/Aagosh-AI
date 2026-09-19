# Aaghosh System Architecture

Aaghosh is an AI-powered personalized parenting companion designed around the conceptual loop:

**Assess → Track → Guide → Adapt**

## High-Level Architecture

```
React Frontend (Vite, Tailwind CSS, Axios, React Router)
            │
            ▼
     REST API (/api/v1)
            │
            ▼
 FastAPI Backend (Python, Pydantic)
            │
       ┌────┴────────────────────┐
       ▼                         ▼
 SQLAlchemy ORM             RAG Pipeline
 (SessionLocal, Engine)     (Knowledge Retrieval)
       │                         │
       ▼                         ▼
 PostgreSQL (Supabase)    ChromaDB Vector Store
                          (data/chroma_store/)
                          ┌─────────────────┐
                          │ Fallback:        │
                          │ FileVectorStore  │
                          │ (data/knowledge_ │
                          │  store.json)     │
                          └─────────────────┘
```

## Architectural Design Principles

1. **Separation of Concerns**:
   - `frontend/`: Single Page Application handles UI presentation, user interactions, routing, and client-side state.
   - `backend/`: Business rules, validation, domain models, and API logic.
   - `AI Services`: Modularised and decoupled from core backend infrastructure.

2. **Clean Layered Architecture**:
   - `api/`: Endpoint controllers & routers handling HTTP requests and responses.
   - `schemas/`: Pydantic request & response validation schemas.
   - `models/`: SQLAlchemy ORM entity definitions.
   - `repositories/`: Data access layer isolating SQL queries.
   - `services/`: Core domain business logic.
   - `core/`: Global settings, constants, and configuration handlers.

3. **RAG (Retrieval-Augmented Generation) Pipeline**:
   - `knowledge/parser.py`: Extracts and chunks content from parenting PDF documents.
   - `knowledge/embeddings.py`: Generates text embeddings (OpenAI API or local TF-IDF fallback).
   - `knowledge/vector_store.py`: Stores and retrieves vectors.
     - **Primary**: `ChromaVectorStore` — persistent, ANN-indexed ChromaDB store with native metadata filtering (age range, category, tags).
     - **Fallback**: `FileVectorStore` — JSON-based store used when the `chromadb` package is not installed.
     - **Factory**: `get_vector_store()` automatically selects the best available backend based on the `VECTOR_STORE` environment variable.
   - `knowledge/retrieval.py`: Orchestrates query embedding + vector search with hybrid keyword re-ranking.
   - `knowledge/ingest.py`: Idempotent PDF ingestion pipeline (parse → embed → store).

4. **Important Product & Safety Principle**:
   Aaghosh is **NOT a medical diagnosis system** and **NOT a replacement for a psychologist, psychiatrist, doctor, or qualified professional**.

## Key Environment Variables

| Variable             | Description                                     | Default          |
|----------------------|-------------------------------------------------|------------------|
| `VECTOR_STORE`       | `chroma` or `file`                              | `chroma`         |
| `CHROMA_PERSIST_DIR` | Path for ChromaDB persistence                   | `data/chroma_store` |
| `EMBEDDING_PROVIDER` | `local` (TF-IDF) or `openai`                   | `local`          |
| `LLM_PROVIDER`       | `groq`, `openai`, `gemini`, or `mock`           | `groq`           |
| `TOP_K_KNOWLEDGE_RESULTS` | Number of knowledge chunks retrieved per query | `5`        |
