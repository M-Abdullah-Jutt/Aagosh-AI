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
            ▼
 SQL Alchemy ORM (SessionLocal, Engine)
            │
            ▼
 Microsoft SQL Server Database
```

## Architectural Design Principles

1. **Separation of Concerns**:
   - `frontend/`: Single Page Application handles UI presentation, user interactions, routing, and client-side state.
   - `backend/`: Business rules, validation, domain models, and API logic.
   - `AI Services`: Modularized and decoupled from core backend infrastructure.

2. **Clean Layered Architecture**:
   - `api/`: Endpoint controllers & routers handling HTTP requests and responses.
   - `schemas/`: Pydantic request & response validation schemas.
   - `models/`: SQLAlchemy ORM entity definitions.
   - `repositories/`: Data access layer isolating SQL queries.
   - `services/`: Core domain business logic.
   - `core/`: Global settings, constants, and configuration handlers.

3. **Important Product & Safety Principle**:
   Aaghosh is **NOT a medical diagnosis system** and **NOT a replacement for a psychologist, psychiatrist, doctor, or qualified professional**.
