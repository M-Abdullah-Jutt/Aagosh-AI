import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.child import Child
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def parent_a():
    db = SessionLocal()
    db.query(User).filter(User.email == "checkin_parent_a@test.com").delete()
    db.commit()
    user = User(
        full_name="CheckIn Parent A",
        email="checkin_parent_a@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.id})

    # Create child for Parent A
    child = Child(
        user_id=user.id,
        first_name="Child A",
        date_of_birth=date(2018, 1, 1)
    )
    db.add(child)
    db.commit()
    db.refresh(child)

    child_id = child.id
    db.close()
    return {"user": user, "token": token, "child_id": child_id}


@pytest.fixture
def parent_b():
    db = SessionLocal()
    db.query(User).filter(User.email == "checkin_parent_b@test.com").delete()
    db.commit()
    user = User(
        full_name="CheckIn Parent B",
        email="checkin_parent_b@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.id})

    # Create child for Parent B
    child = Child(
        user_id=user.id,
        first_name="Child B",
        date_of_birth=date(2019, 5, 10)
    )
    db.add(child)
    db.commit()
    db.refresh(child)

    child_id = child.id
    db.close()
    return {"user": user, "token": token, "child_id": child_id}


# 1. Authenticated user can create a check-in
def test_create_check_in_authenticated(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    payload = {
        "check_in_date": "2026-09-04",
        "overall_mood": "good",
        "general_notes": "Great day overall",
        "events": [
            {
                "emotion": "excited",
                "intensity": 3,
                "trigger": "school",
                "behavior_description": "Excited about art project"
            }
        ]
    }
    res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["overall_mood"] == "good"
    assert data["events_count"] == 1


# 2. Unauthenticated user cannot create a check-in
def test_create_check_in_unauthenticated(parent_a):
    payload = {"check_in_date": "2026-09-04", "overall_mood": "good"}
    res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins", json=payload)
    assert res.status_code == 401


# 3. User can list their own check-ins
def test_list_check_ins(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-03", "overall_mood": "okay"}, headers=headers)
    client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers)

    res = client.get(f"/api/v1/children/{child_id}/check-ins", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 2


# 4. User can retrieve their own check-in
def test_retrieve_own_check_in(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "difficult"}, headers=headers)
    check_in_id = c_res.json()["id"]

    res = client.get(f"/api/v1/children/{child_id}/check-ins/{check_in_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["overall_mood"] == "difficult"


# 5. User can update their own check-in
def test_update_own_check_in(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "okay"}, headers=headers)
    check_in_id = c_res.json()["id"]

    upd_res = client.put(f"/api/v1/children/{child_id}/check-ins/{check_in_id}", json={"overall_mood": "good"}, headers=headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["overall_mood"] == "good"


# 6. User can delete their own check-in
def test_delete_own_check_in(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers)
    check_in_id = c_res.json()["id"]

    del_res = client.delete(f"/api/v1/children/{child_id}/check-ins/{check_in_id}", headers=headers)
    assert del_res.status_code == 200

    get_res = client.get(f"/api/v1/children/{child_id}/check-ins/{check_in_id}", headers=headers)
    assert get_res.status_code == 404


# 7. User cannot access another user's check-in
def test_cannot_access_other_user_check_in(parent_a, parent_b):
    headers_a = {"Authorization": f"Bearer {parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {parent_b['token']}"}

    c_res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers_a)
    check_in_id = c_res.json()["id"]

    # Parent B tries to access Parent A's check-in
    res = client.get(f"/api/v1/children/{parent_a['child_id']}/check-ins/{check_in_id}", headers=headers_b)
    assert res.status_code == 404


# 8. User cannot modify another user's check-in
def test_cannot_modify_other_user_check_in(parent_a, parent_b):
    headers_a = {"Authorization": f"Bearer {parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {parent_b['token']}"}

    c_res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers_a)
    check_in_id = c_res.json()["id"]

    res = client.put(f"/api/v1/children/{parent_a['child_id']}/check-ins/{check_in_id}", json={"overall_mood": "difficult"}, headers=headers_b)
    assert res.status_code == 404


# 9. User can create a behavior event
def test_create_behavior_event(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "difficult"}, headers=headers)
    check_in_id = c_res.json()["id"]

    event_payload = {
        "emotion": "frustrated",
        "intensity": 4,
        "trigger": "screen_time",
        "behavior_description": "Turned off TV and cried",
        "parent_response": "talked_calmly",
        "outcome": "calmed_down"
    }
    e_res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json=event_payload, headers=headers)
    assert e_res.status_code == 201
    data = e_res.json()
    assert data["emotion"] == "frustrated"
    assert data["intensity"] == 4


# 10. User can list behavior events
def test_list_behavior_events(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "difficult"}, headers=headers)
    check_in_id = c_res.json()["id"]

    client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "sad", "intensity": 2, "behavior_description": "Event 1"}, headers=headers)
    client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "angry", "intensity": 4, "behavior_description": "Event 2"}, headers=headers)

    res = client.get(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


# 11. User can retrieve a behavior event
def test_retrieve_behavior_event(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "okay"}, headers=headers)
    check_in_id = c_res.json()["id"]

    e_res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "anxious", "intensity": 3, "behavior_description": "Felt nervous"}, headers=headers)
    event_id = e_res.json()["id"]

    get_event_res = client.get(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events/{event_id}", headers=headers)
    assert get_event_res.status_code == 200
    assert get_event_res.json()["emotion"] == "anxious"


# 12. User can update a behavior event
def test_update_behavior_event(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "okay"}, headers=headers)
    check_in_id = c_res.json()["id"]

    e_res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "sad", "intensity": 2, "behavior_description": "Initial text"}, headers=headers)
    event_id = e_res.json()["id"]

    upd_res = client.put(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events/{event_id}", json={"intensity": 3, "behavior_description": "Updated text"}, headers=headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["intensity"] == 3
    assert upd_res.json()["behavior_description"] == "Updated text"


# 13. User can delete a behavior event
def test_delete_behavior_event(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "okay"}, headers=headers)
    check_in_id = c_res.json()["id"]

    e_res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "calm", "intensity": 1, "behavior_description": "Quiet time"}, headers=headers)
    event_id = e_res.json()["id"]

    del_res = client.delete(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events/{event_id}", headers=headers)
    assert del_res.status_code == 200

    get_res = client.get(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events/{event_id}", headers=headers)
    assert get_res.status_code == 404


# 14. User cannot access another user's behavior event
def test_cannot_access_other_user_behavior_event(parent_a, parent_b):
    headers_a = {"Authorization": f"Bearer {parent_a['token']}"}
    headers_b = {"Authorization": f"Bearer {parent_b['token']}"}

    c_res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers_a)
    check_in_id = c_res.json()["id"]

    e_res = client.post(f"/api/v1/children/{parent_a['child_id']}/check-ins/{check_in_id}/events", json={"emotion": "excited", "intensity": 2, "behavior_description": "Happy event"}, headers=headers_a)
    event_id = e_res.json()["id"]

    # Parent B attempts to access Parent A's behavior event
    res = client.get(f"/api/v1/children/{parent_a['child_id']}/check-ins/{check_in_id}/events/{event_id}", headers=headers_b)
    assert res.status_code == 404


# 15. Invalid emotion is rejected
def test_reject_invalid_emotion(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers)
    check_in_id = c_res.json()["id"]

    res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "invalid_emotion_type", "intensity": 2, "behavior_description": "Test"}, headers=headers)
    assert res.status_code == 422


# 16. Invalid intensity is rejected
def test_reject_invalid_intensity(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers)
    check_in_id = c_res.json()["id"]

    # Intensity > 5
    res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "sad", "intensity": 10, "behavior_description": "Test"}, headers=headers)
    assert res.status_code == 422


# 17. Invalid trigger is rejected
def test_reject_invalid_trigger(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good"}, headers=headers)
    check_in_id = c_res.json()["id"]

    res = client.post(f"/api/v1/children/{child_id}/check-ins/{check_in_id}/events", json={"emotion": "angry", "intensity": 3, "trigger": "invalid_trigger_name", "behavior_description": "Test"}, headers=headers)
    assert res.status_code == 422


# 18. Check-in can exist without behavior events
def test_check_in_without_events(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(f"/api/v1/children/{child_id}/check-ins", json={"check_in_date": "2026-09-04", "overall_mood": "good", "general_notes": "Quiet day, no events"}, headers=headers)
    assert c_res.status_code == 201
    data = c_res.json()
    assert data["events_count"] == 0
    assert len(data["behavior_events"]) == 0


# 19. Multiple behavior events can belong to one check-in
def test_multiple_events_belong_to_check_in(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(
        f"/api/v1/children/{child_id}/check-ins",
        json={
            "check_in_date": "2026-09-04",
            "overall_mood": "difficult",
            "events": [
                {"emotion": "frustrated", "intensity": 3, "behavior_description": "Morning event"},
                {"emotion": "angry", "intensity": 4, "behavior_description": "Afternoon event"}
            ]
        },
        headers=headers
    )
    assert c_res.status_code == 201
    assert c_res.json()["events_count"] == 2


# 20. Deleting a check-in handles associated behavior events correctly (cascade)
def test_delete_check_in_cascades_events(parent_a):
    headers = {"Authorization": f"Bearer {parent_a['token']}"}
    child_id = parent_a["child_id"]
    c_res = client.post(
        f"/api/v1/children/{child_id}/check-ins",
        json={
            "check_in_date": "2026-09-04",
            "overall_mood": "difficult",
            "events": [
                {"emotion": "frustrated", "intensity": 3, "behavior_description": "Event to be cascaded"}
            ]
        },
        headers=headers
    )
    check_in_id = c_res.json()["id"]

    # Delete check-in
    client.delete(f"/api/v1/children/{child_id}/check-ins/{check_in_id}", headers=headers)

    # Verify event table in DB no longer contains event
    db = SessionLocal()
    orphaned_events = db.query(BehaviorEvent).filter(BehaviorEvent.check_in_id == check_in_id).all()
    assert len(orphaned_events) == 0
    db.close()
