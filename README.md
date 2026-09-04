# Aaghosh – AI-Powered Personalized Parenting Companion

**Aaghosh** is a modern, evidence-informed web application designed to support parents through personalized parenting insights and structured behavioral tracking based on the conceptual loop:

**Assess → Track → Guide → Adapt**

> [!IMPORTANT]
> **Product Principle & Safety Disclaimer**  
> Aaghosh is **NOT a medical diagnosis system** and is **NOT a replacement** for a licensed psychologist, psychiatrist, doctor, or other qualified healthcare professional.

---

## 1. Project Overview

Aaghosh helps parents:
1. Register and authenticate securely as parents.
2. Create and manage child profiles.
3. Define personalized parenting goals.
4. Record daily child behavior and situations.
5. Track behavioral patterns over time.
6. Receive personalized, evidence-informed parenting guidance.
7. View basic progress and behavioral insights.

---

## 2. Architecture & Technology Stack

```
React Frontend (Vite + Tailwind CSS + Axios + AuthContext)
                           │
                           ▼
                 REST API (/api/v1)
                           │
                           ▼
           FastAPI Backend (Python + Pydantic v2)
                           │
                           ▼
           Security Module (Argon2id + PyJWT)
                           │
                           ▼
   SQLAlchemy ORM (Users, Children, Profiles, Goals)
                           │
                           ▼
              Microsoft SQL Server Database
```

### Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3.4, React Router DOM 6, Axios, Lucide Icons.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Argon2id (`argon2-cffi`), PyJWT, Uvicorn.
- **Database**: Microsoft SQL Server (via `pyodbc` driver).
- **Prohibited Databases**: PostgreSQL and MS Access are explicitly **not** used.

---

## 3. Database Schema Overview (Microsoft SQL Server)

1. **`users` Table**: Parent accounts with Argon2id password hashing.
2. **`children` Table**: Child records linked via `user_id` Foreign Key.
3. **`child_profiles` Table**: Non-clinical parent observations (`strengths`, `challenges`, `personality_notes`, `communication_style`) linked via `child_id` Foreign Key (One-to-One).
4. **`parenting_goals` Table**: Active and historical parenting goals (`goal_type`, `description`, `priority`, `is_active`) linked via `child_id` Foreign Key.

---

## 4. Environment Variables

### Backend (`backend/.env`)
```env
# Server Configuration
PROJECT_NAME="Aaghosh API"
API_V1_STR="/api/v1"
DEBUG=True

# CORS Configuration
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]

# Microsoft SQL Server Database Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_PORT=1433
DB_NAME=AaghoshDB
DB_USER=sa
DB_PASSWORD=YourStrongPassw0rd!
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=True

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 5. Local Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Microsoft SQL Server**: Installed locally (e.g. SQLEXPRESS) or accessible on port 1433
- **ODBC Driver**: Microsoft ODBC Driver 17 or 18 for SQL Server

---

### Backend Setup

1. Navigate to `backend`:
   ```bash
   cd backend
   ```

2. Activate Python virtual environment and install dependencies:
   ```bash
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will run on `http://localhost:8000`.

---

### Frontend Setup

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The React app will run on `http://localhost:5173`.

---

## 6. API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Parent registration
- `POST /api/v1/auth/login` - Parent authentication & JWT issuance
- `GET /api/v1/auth/me` - Authenticated parent profile (Protected)

### Children Management
- `GET /api/v1/children` - List parent's children (Protected)
- `POST /api/v1/children` - Create a child (Protected)
- `GET /api/v1/children/{child_id}` - Get child details, profile, and goals (Protected)
- `PUT /api/v1/children/{child_id}` - Update child info (Protected)
- `DELETE /api/v1/children/{child_id}` - Delete child (Protected)

### Child Profile Observations
- `GET /api/v1/children/{child_id}/profile` - Get profile observations (Protected)
- `POST /api/v1/children/{child_id}/profile` - Create/update profile observations (Protected)
- `PUT /api/v1/children/{child_id}/profile` - Update profile observations (Protected)

### Parenting Goals
- `GET /api/v1/children/{child_id}/goals` - List parenting goals (Protected)
- `POST /api/v1/children/{child_id}/goals` - Create parenting goal (Protected)
- `PUT /api/v1/children/{child_id}/goals/{goal_id}` - Update or deactivate goal (Protected)
- `DELETE /api/v1/children/{child_id}/goals/{goal_id}` - Delete goal (Protected)

---

## 7. Automated Testing Instructions

Run all 26 unit & integration tests using pytest:
```bash
cd backend
venv\Scripts\pytest.exe -v
```

---

## 8. Development Scope Status

- ✅ **Step 1**: Foundation & Core Setup
- ✅ **Step 2**: Database Configuration (SQL Server)
- ✅ **Step 3**: Parent Authentication (Argon2id + JWT + AuthContext)
- ✅ **Step 4**: Child Profile & Parenting Goals (Children, Profiles, Goals CRUD + Ownership Enforcement)

*Note: Daily check-ins, behavior tracking, AI chatbot, RAG, and recommendations belong to subsequent development steps.*
