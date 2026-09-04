import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.child import Child, ChildProfile, ParentingGoal
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def context_test_data():
    db = SessionLocal()
    # Clean up test users
    db.query(User).filter(User.email.in_(["context_a@test.com", "context_b@test.com"])).delete()
    db.commit()

    # Parent Alpha
    parent_a = User(
        full_name="Context Parent Alpha",
        email="context_a@test.com",
        password_hash=hash_password("Password123!"),
        is_active=True,
    )
    db.add(parent_a)

    # Parent Beta (for cross-parent security test)
    parent_b = User(
        full_name="Context Parent Beta",
        email="context_b@test.com",
        password_hash=hash_password("Password123!"),
        is_active=True,
    )
    db.add(parent_b)
    db.commit()
    db.refresh(parent_a)
    db.refresh(parent_b)

    token_a = create_access_token(data={"sub": parent_a.id})
    token_b = create_access_token(data={"sub": parent_b.id})

    # Child A (Toddler, 2 years old)
    today = date.today()
    dob_toddler = date(today.year - 2, today.month, today.day)

    child_a = Child(
        user_id=parent_a.id,
        first_name="Tommy",
        date_of_birth=dob_toddler,
        gender="male"
    )
    db.add(child_a)

    # Child Minimal (No profile, no goals, no check-ins)
    child_min = Child(
        user_id=parent_a.id,
        first_name="Baby Min",
        date_of_birth=date(today.year - 1, today.month, today.day),
        gender="female"
    )
    db.add(child_min)
    db.commit()
    db.refresh(child_a)
    db.refresh(child_min)

    # Profile for Child A
    profile_a = ChildProfile(
        child_id=child_a.id,
        strengths="Curious, energetic, loves blocks",
        challenges="Tantrums during transitions",
        personality_notes="Affectionate and persistent",
        communication_style="Uses 2-word phrases"
    )
    db.add(profile_a)

    # Active Goal for Child A
    goal_a = ParentingGoal(
        child_id=child_a.id,
        goal_type="screen_time",
        description="Limit tablet screen time before dinner",
        priority="high",
        is_active=True
    )
    db.add(goal_a)

    # 3 Check-Ins & 4 Behavior Events for Child A
    ci1 = DailyCheckIn(child_id=child_a.id, check_in_date=today - timedelta(days=2), overall_mood="difficult")
    db.add(ci1)
    db.commit()
    db.refresh(ci1)

    e1 = BehaviorEvent(
        check_in_id=ci1.id,
        emotion="angry",
        intensity=4,
        trigger="screen_time",
        behavior_description="Screamed when tablet was turned off",
        parent_response="set_boundary",
        outcome="partially_improved"
    )
    e2 = BehaviorEvent(
        check_in_id=ci1.id,
        emotion="frustrated",
        intensity=3,
        trigger="transition",
        behavior_description="Threw toy when leaving the park",
        parent_response="co_regulation",
        outcome="deescalated"
    )
    db.add(e1)
    db.add(e2)

    ci2 = DailyCheckIn(child_id=child_a.id, check_in_date=today - timedelta(days=1), overall_mood="okay")
    db.add(ci2)
    db.commit()
    db.refresh(ci2)

    e3 = BehaviorEvent(
        check_in_id=ci2.id,
        emotion="angry",
        intensity=5,
        trigger="bedtime",
        behavior_description="Refused bedtime routine",
        parent_response="verbal_redirection",
        outcome="deescalated"
    )
    db.add(e3)

    ci3 = DailyCheckIn(child_id=child_a.id, check_in_date=today, overall_mood="good")
    db.add(ci3)
    db.commit()
    db.refresh(ci3)

    e4 = BehaviorEvent(
        check_in_id=ci3.id,
        emotion="calm",
        intensity=1,
        trigger="routine_change",
        behavior_description="Handled transition smoothly",
        parent_response="verbal_redirection",
        outcome="deescalated"
    )
    db.add(e4)
    db.commit()

    user_a_id = parent_a.id
    child_a_id = child_a.id
    child_min_id = child_min.id
    user_b_id = parent_b.id

    db.close()

    return {
        "user_a_id": user_a_id,
        "token_a": token_a,
        "token_b": token_b,
        "child_a_id": child_a_id,
        "child_min_id": child_min_id,
        "user_b_id": user_b_id,
    }


def test_context_assembly_valid_child(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {
        "query": "My toddler has a tantrum when leaving the park.",
        "period": "30d"
    }
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["child"]["id"] == context_test_data["child_a_id"]
    assert data["child"]["first_name"] == "Tommy"
    assert data["child"]["age_years"] == 2
    assert "2 years" in data["child"]["age_display"]
    assert data["profile"]["strengths"] == "Curious, energetic, loves blocks"
    assert len(data["parenting_goals"]) == 1
    assert data["recent_observations"]["check_ins"] is not None
    assert data["recent_observations"]["behavior_events"] is not None
    assert data["analytics"]["events"]["total"] == 4
    assert len(data["retrieved_knowledge"]) > 0


def test_context_assembly_unauthenticated(context_test_data):
    payload = {"query": "My child refuses to sleep."}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload)
    assert res.status_code == 401


def test_context_assembly_cross_parent_isolation(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_b']}"}
    payload = {"query": "My child has a tantrum."}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Child profile not found."


def test_child_age_calculation_accuracy(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Tantrum advice"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["child"]["age_years"] == 2
    assert data["child"]["age_months"] == 0
    assert "2 years" in data["child"]["age_display"]


def test_profile_inclusion(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Profile test"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["profile"] is not None
    assert data["profile"]["challenges"] == "Tantrums during transitions"


def test_parenting_goals_inclusion(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Goal test"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert len(data["parenting_goals"]) == 1
    assert data["parenting_goals"][0]["goal_type"] == "screen_time"


def test_recent_check_ins_inclusion_and_capping(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Check-in test", "max_check_ins": 2}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    check_ins = data["recent_observations"]["check_ins"]
    assert len(check_ins) == 2


def test_recent_behavior_events_inclusion_and_capping(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Event capping test", "max_events": 2}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    events = data["recent_observations"]["behavior_events"]
    assert len(events) == 2


def test_analytics_inclusion(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Analytics check"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    analytics = data["analytics"]
    assert analytics["events"]["total"] == 4
    assert analytics["emotions"]["most_observed"] in ["angry", "frustrated", "calm"]


def test_retrieved_knowledge_inclusion(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "My toddler throws a tantrum at the park"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    retrieved = data["retrieved_knowledge"]
    assert len(retrieved) > 0
    assert any("tantrum" in r["content"].lower() or "toddler" in r["category"].lower() for r in retrieved)


def test_missing_profile_handling(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Missing profile child"}
    res = client.post(f"/api/v1/children/{context_test_data['child_min_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["profile"] is None


def test_missing_parenting_goals_handling(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Missing goals child"}
    res = client.post(f"/api/v1/children/{context_test_data['child_min_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["parenting_goals"] == []


def test_missing_behavioral_data_handling(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Missing observations child"}
    res = client.post(f"/api/v1/children/{context_test_data['child_min_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["recent_observations"]["check_ins"] == []
    assert data["recent_observations"]["behavior_events"] == []
    assert data["analytics"]["data_sufficiency"]["level"] == "insufficient_data"


def test_configurable_top_k_limit(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Top-K test", "top_k_knowledge": 2}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert len(data["retrieved_knowledge"]) <= 2
    assert data["metadata"]["knowledge_results_count"] == len(data["retrieved_knowledge"])


def test_metadata_knowledge_results_count_match(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "My toddler throws a tantrum at the park", "top_k_knowledge": 3}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    assert data["metadata"]["knowledge_results_count"] == len(data["retrieved_knowledge"])



def test_age_aware_retrieval_integration(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Safety and boundary testing"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    data = res.json()
    retrieved = data["retrieved_knowledge"]
    assert len(retrieved) > 0
    # Tommy is 2 years old -> Toddlers category (1-3) should be present
    assert any(r["age_min"] <= 2 <= r["age_max"] for r in retrieved)


def test_db_immutability(context_test_data):
    db = SessionLocal()
    events_before = db.query(BehaviorEvent).count()
    checkins_before = db.query(DailyCheckIn).count()
    goals_before = db.query(ParentingGoal).count()
    db.close()

    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Immutability check"}
    client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)

    db = SessionLocal()
    events_after = db.query(BehaviorEvent).count()
    checkins_after = db.query(DailyCheckIn).count()
    goals_after = db.query(ParentingGoal).count()
    db.close()

    assert events_before == events_after
    assert checkins_before == checkins_after
    assert goals_before == goals_after


def test_context_no_secrets_exposed(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Secret exposure check"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    text = res.text.lower()
    assert "password_hash" not in text
    assert "secret_key" not in text
    assert "jwt_secret" not in text
    assert "connection_string" not in text


def test_context_no_clinical_conclusions(context_test_data):
    headers = {"Authorization": f"Bearer {context_test_data['token_a']}"}
    payload = {"query": "Clinical check"}
    res = client.post(f"/api/v1/children/{context_test_data['child_a_id']}/context", json=payload, headers=headers)
    text = res.text.lower()
    assert "pathological" not in text
    assert "psychiatric" not in text
    assert "clinically significant" not in text
    assert "disordered" not in text
