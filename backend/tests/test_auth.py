import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db, SessionLocal
from app.models.user import User
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_test_users():
    """
    Fixture that runs before each test to clean up test user records.
    """
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.like("%@test.com")).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    yield
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.like("%@test.com")).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


# 1. Successful registration
def test_register_success():
    payload = {
        "full_name": "Test Parent",
        "email": "register_success@test.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test Parent"
    assert data["email"] == "register_success@test.com"
    assert data["is_active"] is True
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


# 2. Duplicate email registration
def test_register_duplicate_email():
    payload = {
        "full_name": "Parent One",
        "email": "duplicate@test.com",
        "password": "password123"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


# 3. Invalid registration data
def test_register_invalid_data():
    # Short password (< 8 chars)
    short_pwd_payload = {
        "full_name": "Test User",
        "email": "invalid_pwd@test.com",
        "password": "short"
    }
    res1 = client.post("/api/v1/auth/register", json=short_pwd_payload)
    assert res1.status_code == 422

    # Invalid email format
    invalid_email_payload = {
        "full_name": "Test User",
        "email": "not-an-email",
        "password": "password123"
    }
    res2 = client.post("/api/v1/auth/register", json=invalid_email_payload)
    assert res2.status_code == 422


# 4. Successful login
def test_login_success():
    reg_payload = {
        "full_name": "Login Parent",
        "email": "login_success@test.com",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "login_success@test.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login_success@test.com"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


# 5. Invalid password login
def test_login_invalid_password():
    reg_payload = {
        "full_name": "Login Parent",
        "email": "invalid_pwd_login@test.com",
        "password": "correctpassword"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "invalid_pwd_login@test.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


# 6. Nonexistent email login
def test_login_nonexistent_email():
    login_payload = {
        "email": "nonexistent@test.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


# 7. /me with valid token
def test_get_me_valid_token():
    reg_payload = {
        "full_name": "Me Parent",
        "email": "me_valid@test.com",
        "password": "password123"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["id"]

    login_res = client.post("/api/v1/auth/login", json={
        "email": "me_valid@test.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "me_valid@test.com"
    assert data["full_name"] == "Me Parent"


# 8. /me without token
def test_get_me_without_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


# 9. /me with invalid token
def test_get_me_invalid_token():
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    assert response.status_code == 401


# 10. Inactive user attempting authentication
def test_inactive_user_authentication():
    db = SessionLocal()
    inactive_user = User(
        full_name="Inactive Parent",
        email="inactive@test.com",
        password_hash=hash_password("password123"),
        is_active=False
    )
    db.add(inactive_user)
    db.commit()
    user_id = inactive_user.id
    db.close()

    # Attempt login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "inactive@test.com",
        "password": "password123"
    })
    assert login_res.status_code in [400, 401, 403]

    # Attempt /me with token generated for inactive user
    token = create_access_token(data={"sub": user_id})
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code in [400, 401, 403]
