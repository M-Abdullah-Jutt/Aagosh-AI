import uuid
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.child import Child, ParentingGoal
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.models.coach import CoachConversation, CoachMessage
from app.core.security import create_access_token
from app.coach.service import coach_service
from app.coach.llm_provider import MockLLMProvider
from app.schemas.coach_schemas import ConversationResponse, ConversationDetailResponse

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def parent_a(db: Session) -> User:
    u = User(
        email=f"parent_a_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="$argon2id$v=19$m=65536,t=3,p=4$dummyhash",
        full_name="Parent Alpha",
        is_active=True
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def parent_b(db: Session) -> User:
    u = User(
        email=f"parent_b_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="$argon2id$v=19$m=65536,t=3,p=4$dummyhash",
        full_name="Parent Beta",
        is_active=True
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def auth_headers_a(parent_a: User) -> dict:
    token = create_access_token(data={"sub": str(parent_a.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_b(parent_b: User) -> dict:
    token = create_access_token(data={"sub": str(parent_b.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def child_a(db: Session, parent_a: User) -> Child:
    today = date.today()
    child = Child(
        user_id=parent_a.id,
        first_name="Leo",
        date_of_birth=date(today.year - 2, today.month, today.day),
        gender="male"
    )
    db.add(child)
    db.commit()
    db.refresh(child)

    goal = ParentingGoal(
        child_id=child.id,
        goal_type="transition",
        description="Park transitions",
        priority="medium",
        is_active=True
    )
    db.add(goal)

    check_in = DailyCheckIn(child_id=child.id, check_in_date=today, overall_mood="difficult")
    db.add(check_in)
    db.commit()
    db.refresh(check_in)

    event = BehaviorEvent(
        check_in_id=check_in.id,
        trigger="transition",
        emotion="frustrated",
        intensity=4,
        behavior_description="Tantrum at park",
        parent_response="set_boundary",
        outcome="deescalated"
    )
    db.add(event)
    db.commit()
    return child


# 1. Create conversation API
def test_create_conversation_api(child_a: Child, auth_headers_a: dict):
    res = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "Park Transitions"},
        headers=auth_headers_a
    )
    assert res.status_code == 201
    data = res.json()
    assert data["child_id"] == child_a.id
    assert data["title"] == "Park Transitions"
    assert data["is_active"] is True


# 2. List conversations API
def test_list_conversations_api(child_a: Child, auth_headers_a: dict):
    client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "Session 1"},
        headers=auth_headers_a
    )
    client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "Session 2"},
        headers=auth_headers_a
    )

    res = client.get(f"/api/v1/children/{child_a.id}/coach/conversations", headers=auth_headers_a)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2


# 3. Ownership security (Parent B trying to access Parent A conversation)
def test_cross_parent_conversation_access_rejected(child_a: Child, auth_headers_a: dict, auth_headers_b: dict):
    res_create = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "Private Session"},
        headers=auth_headers_a
    )
    conv_id = res_create.json()["id"]

    # Parent B tries GET
    res_get = client.get(f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}", headers=auth_headers_b)
    assert res_get.status_code in (403, 404)

    # Parent B tries POST message
    res_msg = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}/messages",
        json={"message": "Hello", "period": "30d"},
        headers=auth_headers_b
    )
    assert res_msg.status_code in (403, 404)

    # Parent B tries DELETE
    res_del = client.delete(f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}", headers=auth_headers_b)
    assert res_del.status_code in (403, 404)


# 4. Archive conversation
def test_archive_conversation_api(child_a: Child, auth_headers_a: dict):
    res_create = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "To Archive"},
        headers=auth_headers_a
    )
    conv_id = res_create.json()["id"]

    res_del = client.delete(f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}", headers=auth_headers_a)
    assert res_del.status_code == 200
    assert res_del.json()["is_active"] is False

    # Verify not in default active listing
    res_list = client.get(f"/api/v1/children/{child_a.id}/coach/conversations", headers=auth_headers_a)
    ids = [c["id"] for c in res_list.json()]
    assert conv_id not in ids


# 5. Send message & auto-titling in conversation
def test_send_message_in_conversation_flow(child_a: Child, auth_headers_a: dict):
    res_create = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={},
        headers=auth_headers_a
    )
    conv_id = res_create.json()["id"]

    msg_payload = {
        "message": "My toddler throws a tantrum when it is time to leave the park.",
        "period": "30d"
    }

    res_msg = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}/messages",
        json=msg_payload,
        headers=auth_headers_a
    )
    assert res_msg.status_code == 200
    resp_data = res_msg.json()
    assert "answer" in resp_data
    assert "key_points" in resp_data
    assert "suggested_steps" in resp_data
    assert len(resp_data["source_references"]) >= 1

    # Verify message persistence & detail GET
    res_detail = client.get(f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}", headers=auth_headers_a)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert len(detail["messages"]) == 2  # 1 User + 1 Assistant
    assert detail["messages"][0]["role"] == "user"
    assert detail["messages"][1]["role"] == "assistant"
    assert detail["title"].startswith("My toddler throws a tantrum")


# 6. Follow-up turn uses history
def test_followup_message_turn(child_a: Child, auth_headers_a: dict):
    res_create = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations",
        json={"title": "Park Followup"},
        headers=auth_headers_a
    )
    conv_id = res_create.json()["id"]

    # Turn 1
    client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}/messages",
        json={"message": "My toddler throws a tantrum when leaving the park.", "period": "30d"},
        headers=auth_headers_a
    )

    # Turn 2 (Follow up)
    res_turn2 = client.post(
        f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}/messages",
        json={"message": "What if he refuses the choices offered?", "period": "30d"},
        headers=auth_headers_a
    )
    assert res_turn2.status_code == 200

    res_detail = client.get(f"/api/v1/children/{child_a.id}/coach/conversations/{conv_id}", headers=auth_headers_a)
    assert len(res_detail.json()["messages"]) == 4  # 2 User + 2 Assistant


# 7. Child deletion cascades conversations
def test_child_deletion_cascades_conversations(db: Session, parent_a: User):
    today = date.today()
    child = Child(user_id=parent_a.id, first_name="Cascaded", date_of_birth=today)
    db.add(child)
    db.commit()

    conv = CoachConversation(user_id=parent_a.id, child_id=child.id, title="Test Cascade")
    db.add(conv)
    db.commit()

    msg = CoachMessage(conversation_id=conv.id, role="user", content="Hello")
    db.add(msg)
    db.commit()

    # Delete child
    db.delete(child)
    db.commit()

    # Verify conversation & message deleted
    assert db.query(CoachConversation).filter_by(id=conv.id).first() is None
    assert db.query(CoachMessage).filter_by(id=msg.id).first() is None
