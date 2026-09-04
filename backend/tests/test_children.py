import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.child import Child, ChildProfile, ParentingGoal
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def test_parent_a():
    db = SessionLocal()
    db.query(User).filter(User.email == "parent_a@test.com").delete()
    db.commit()
    user = User(
        full_name="Parent A",
        email="parent_a@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.id})
    db.close()
    return {"user": user, "token": token}


@pytest.fixture
def test_parent_b():
    db = SessionLocal()
    db.query(User).filter(User.email == "parent_b@test.com").delete()
    db.commit()
    user = User(
        full_name="Parent B",
        email="parent_b@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.id})
    db.close()
    return {"user": user, "token": token}


# 1. Authenticated user can create a child
def test_create_child_authenticated(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    payload = {
        "first_name": "Leo",
        "date_of_birth": "2018-05-15",
        "gender": "male",
        "profile": {
            "strengths": "Creative and curious",
            "challenges": "Gets restless during quiet time"
        },
        "goals": [
            {
                "goal_type": "emotional_regulation",
                "description": "Practice deep breathing",
                "priority": "high"
            }
        ]
    }
    res = client.post("/api/v1/children", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["first_name"] == "Leo"
    assert "id" in data
    assert data["active_goals_count"] == 1


# 2. Unauthenticated user cannot create a child
def test_create_child_unauthenticated():
    payload = {
        "first_name": "Maya",
        "date_of_birth": "2020-01-01"
    }
    res = client.post("/api/v1/children", json=payload)
    assert res.status_code == 401


# 3. User can retrieve their children
def test_get_children_list(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    client.post("/api/v1/children", json={"first_name": "Child 1", "date_of_birth": "2019-01-01"}, headers=headers)
    client.post("/api/v1/children", json={"first_name": "Child 2", "date_of_birth": "2021-06-01"}, headers=headers)

    res = client.get("/api/v1/children", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2


# 4. User can retrieve their own child
def test_get_own_child(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    create_res = client.post(
        "/api/v1/children",
        json={"first_name": "Sam", "date_of_birth": "2017-03-20"},
        headers=headers
    )
    child_id = create_res.json()["id"]

    res = client.get(f"/api/v1/children/{child_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["first_name"] == "Sam"


# 5. User cannot retrieve another user's child
def test_cannot_get_other_user_child(test_parent_a, test_parent_b):
    headers_a = {"Authorization": f"Bearer {test_parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {test_parent_b['token']}"}

    create_res = client.post(
        "/api/v1/children",
        json={"first_name": "Child A", "date_of_birth": "2018-01-01"},
        headers=headers_a
    )
    child_id = create_res.json()["id"]

    # Parent B attempts to read Parent A's child
    res = client.get(f"/api/v1/children/{child_id}", headers=headers_b)
    assert res.status_code == 404


# 6. User can update their child
def test_update_own_child(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    create_res = client.post(
        "/api/v1/children",
        json={"first_name": "Tommy", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/children/{child_id}",
        json={"first_name": "Thomas"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["first_name"] == "Thomas"


# 7. User cannot update another user's child
def test_cannot_update_other_user_child(test_parent_a, test_parent_b):
    headers_a = {"Authorization": f"Bearer {test_parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {test_parent_b['token']}"}

    create_res = client.post(
        "/api/v1/children",
        json={"first_name": "Child A", "date_of_birth": "2018-01-01"},
        headers=headers_a
    )
    child_id = create_res.json()["id"]

    res = client.put(
        f"/api/v1/children/{child_id}",
        json={"first_name": "Hacked Name"},
        headers=headers_b
    )
    assert res.status_code == 404


# 8. User can delete their child
def test_delete_own_child(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    create_res = client.post(
        "/api/v1/children",
        json={"first_name": "Temp Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/children/{child_id}", headers=headers)
    assert del_res.status_code == 200

    get_res = client.get(f"/api/v1/children/{child_id}", headers=headers)
    assert get_res.status_code == 404


# 9. User can create a parenting goal
def test_create_parenting_goal(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Goal Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = c_res.json()["id"]

    goal_payload = {
        "goal_type": "screen_time",
        "description": "Limit screen time to 1 hour daily",
        "priority": "high"
    }
    res = client.post(f"/api/v1/children/{child_id}/goals", json=goal_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["goal_type"] == "screen_time"
    assert data["priority"] == "high"
    assert data["is_active"] is True


# 10. User can retrieve goals
def test_get_parenting_goals(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Goal List Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = c_res.json()["id"]

    client.post(f"/api/v1/children/{child_id}/goals", json={"goal_type": "sleep", "priority": "medium"}, headers=headers)
    client.post(f"/api/v1/children/{child_id}/goals", json={"goal_type": "school", "priority": "low"}, headers=headers)

    res = client.get(f"/api/v1/children/{child_id}/goals", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


# 11. User cannot modify another user's child's goal
def test_cannot_modify_other_user_child_goal(test_parent_a, test_parent_b):
    headers_a = {"Authorization": f"Bearer {test_parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {test_parent_b['token']}"}

    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Parent A Child", "date_of_birth": "2018-01-01"},
        headers=headers_a
    )
    child_id = c_res.json()["id"]

    g_res = client.post(
        f"/api/v1/children/{child_id}/goals",
        json={"goal_type": "communication", "priority": "high"},
        headers=headers_a
    )
    goal_id = g_res.json()["id"]

    # Parent B attempts to update Parent A's child's goal
    res = client.put(
        f"/api/v1/children/{child_id}/goals/{goal_id}",
        json={"priority": "low"},
        headers=headers_b
    )
    assert res.status_code == 404


# 12. User can deactivate a goal
def test_deactivate_goal(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Deactivate Goal Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = c_res.json()["id"]

    g_res = client.post(
        f"/api/v1/children/{child_id}/goals",
        json={"goal_type": "confidence", "priority": "medium"},
        headers=headers
    )
    goal_id = g_res.json()["id"]

    # Deactivate goal
    deact_res = client.put(
        f"/api/v1/children/{child_id}/goals/{goal_id}",
        json={"is_active": False},
        headers=headers
    )
    assert deact_res.status_code == 200
    assert deact_res.json()["is_active"] is False


# 13. Profile can be created
def test_create_child_profile(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Profile Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = c_res.json()["id"]

    prof_payload = {
        "strengths": "Enthusiastic learner",
        "challenges": "Difficulty focusing on long tasks",
        "personality_notes": "Warm and friendly",
        "communication_style": "Verbal and energetic"
    }
    p_res = client.post(f"/api/v1/children/{child_id}/profile", json=prof_payload, headers=headers)
    assert p_res.status_code == 201
    data = p_res.json()
    assert data["strengths"] == "Enthusiastic learner"
    assert data["child_id"] == child_id


# 14. Profile can be updated
def test_update_child_profile(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c_res = client.post(
        "/api/v1/children",
        json={"first_name": "Update Profile Child", "date_of_birth": "2018-01-01"},
        headers=headers
    )
    child_id = c_res.json()["id"]

    client.post(
        f"/api/v1/children/{child_id}/profile",
        json={"strengths": "Initial strength"},
        headers=headers
    )

    upd_res = client.put(
        f"/api/v1/children/{child_id}/profile",
        json={"strengths": "Updated strength"},
        headers=headers
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["strengths"] == "Updated strength"


# 15. Profile belongs to the correct child
def test_profile_belongs_to_correct_child(test_parent_a):
    headers = {"Authorization": f"Bearer {test_parent_a['token']}"}
    c1 = client.post("/api/v1/children", json={"first_name": "Child One", "date_of_birth": "2018-01-01"}, headers=headers).json()
    c2 = client.post("/api/v1/children", json={"first_name": "Child Two", "date_of_birth": "2020-01-01"}, headers=headers).json()

    client.post(f"/api/v1/children/{c1['id']}/profile", json={"strengths": "Child One Strengths"}, headers=headers)
    client.post(f"/api/v1/children/{c2['id']}/profile", json={"strengths": "Child Two Strengths"}, headers=headers)

    p1 = client.get(f"/api/v1/children/{c1['id']}/profile", headers=headers).json()
    p2 = client.get(f"/api/v1/children/{c2['id']}/profile", headers=headers).json()

    assert p1["child_id"] == c1["id"]
    assert p1["strengths"] == "Child One Strengths"
    assert p2["child_id"] == c2["id"]
    assert p2["strengths"] == "Child Two Strengths"
