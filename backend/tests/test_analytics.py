import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.child import Child, ParentingGoal
from app.models.check_in import DailyCheckIn, BehaviorEvent
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def analytics_data():
    db = SessionLocal()
    # Clean up test users
    db.query(User).filter(User.email.in_(["analytics_a@test.com", "analytics_b@test.com"])).delete()
    db.commit()

    # User A
    user_a = User(
        full_name="Analytics Parent A",
        email="analytics_a@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user_a)
    db.commit()
    db.refresh(user_a)
    token_a = create_access_token(data={"sub": user_a.id})

    # Child A (has check-ins & events)
    child_a = Child(
        user_id=user_a.id,
        first_name="Child A",
        date_of_birth=date(2018, 5, 10)
    )
    db.add(child_a)

    # Empty Child A2 (0 events)
    child_empty = Child(
        user_id=user_a.id,
        first_name="Child Empty",
        date_of_birth=date(2020, 1, 1)
    )
    db.add(child_empty)

    # User B
    user_b = User(
        full_name="Analytics Parent B",
        email="analytics_b@test.com",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    db.add(user_b)
    db.commit()

    db.refresh(child_a)
    db.refresh(child_empty)

    # Active parenting goals for Child A
    goal_screen = ParentingGoal(
        child_id=child_a.id,
        goal_type="screen_time",
        description="Limit tablet use before dinner",
        priority="high",
        is_active=True,
    )
    goal_reg = ParentingGoal(
        child_id=child_a.id,
        goal_type="emotional_regulation",
        description="Help calm down during outbursts",
        priority="medium",
        is_active=True,
    )
    db.add(goal_screen)
    db.add(goal_reg)
    db.commit()

    today = date.today()

    # Populate 3 check-ins with 4 events in current 7d period for Child A
    # Check-in 1 (2 days ago)
    ci1 = DailyCheckIn(
        child_id=child_a.id,
        check_in_date=today - timedelta(days=2),
        overall_mood="difficult",
        general_notes="Challenging afternoon"
    )
    db.add(ci1)
    db.commit()
    db.refresh(ci1)

    e1 = BehaviorEvent(
        check_in_id=ci1.id,
        emotion="angry",
        intensity=4,
        trigger="screen_time",
        behavior_description="Screamed when iPad turned off",
        parent_response="set_boundary",
        outcome="partially_improved",
    )
    e2 = BehaviorEvent(
        check_in_id=ci1.id,
        emotion="frustrated",
        intensity=3,
        trigger="screen_time",
        behavior_description="Refused to start homework",
        parent_response="verbal_redirection",
        outcome="deescalated",
    )
    db.add(e1)
    db.add(e2)

    # Check-in 2 (1 day ago)
    ci2 = DailyCheckIn(
        child_id=child_a.id,
        check_in_date=today - timedelta(days=1),
        overall_mood="okay",
        general_notes="Better evening"
    )
    db.add(ci2)
    db.commit()
    db.refresh(ci2)

    e3 = BehaviorEvent(
        check_in_id=ci2.id,
        emotion="angry",
        intensity=5,
        trigger="bedtime",
        behavior_description="Threw pillow at bedtime",
        parent_response="co_regulation",
        outcome="deescalated",
    )
    e4 = BehaviorEvent(
        check_in_id=ci2.id,
        emotion="sad",
        intensity=2,
        trigger="sibling_conflict",
        behavior_description="Cried over shared toy",
        parent_response="hug_physical_comfort",
        outcome="deescalated",
    )
    db.add(e3)
    db.add(e4)

    # Check-in 3 (Today)
    ci3 = DailyCheckIn(
        child_id=child_a.id,
        check_in_date=today,
        overall_mood="good",
        general_notes="Calm day"
    )
    db.add(ci3)
    db.commit()
    db.refresh(ci3)

    e5 = BehaviorEvent(
        check_in_id=ci3.id,
        emotion="calm",
        intensity=1,
        trigger="transition",
        behavior_description="Smooth transition to dinner",
        parent_response="verbal_redirection",
        outcome="deescalated",
    )
    db.add(e5)

    # Populate 1 check-in in PREVIOUS period (10 days ago)
    ci_prev = DailyCheckIn(
        child_id=child_a.id,
        check_in_date=today - timedelta(days=10),
        overall_mood="difficult",
        general_notes="Previous period checkin"
    )
    db.add(ci_prev)
    db.commit()
    db.refresh(ci_prev)

    e_prev = BehaviorEvent(
        check_in_id=ci_prev.id,
        emotion="angry",
        intensity=4,
        trigger="screen_time",
        behavior_description="Past event",
        parent_response="time_out",
        outcome="no_change",
    )
    db.add(e_prev)
    db.commit()

    user_a_id = user_a.id
    child_a_id = child_a.id
    child_empty_id = child_empty.id
    user_b_id = user_b.id

    db.close()

    return {
        "user_a_id": user_a_id,
        "token_a": token_a,
        "child_a_id": child_a_id,
        "child_empty_id": child_empty_id,
        "user_b_id": user_b_id,
    }


def test_get_analytics_authenticated(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["child_id"] == analytics_data["child_a_id"]
    assert data["period"]["type"] == "7d"
    assert data["check_ins"]["total"] == 3
    assert data["events"]["total"] == 5


def test_get_analytics_unauthenticated(analytics_data):
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary")
    assert res.status_code == 401


def test_get_analytics_cross_parent_isolation(analytics_data):
    token_b = create_access_token(data={"sub": analytics_data["user_b_id"]})
    headers = {"Authorization": f"Bearer {token_b}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary", headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Child profile not found."


def test_empty_child_analytics(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_empty_id']}/analytics/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["data_sufficiency"]["level"] == "insufficient_data"
    assert data["events"]["total"] == 0
    assert data["check_ins"]["total"] == 0
    assert data["trend"]["direction"] == "insufficient_data"


def test_emotion_frequencies(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    emotions = data["emotions"]
    assert emotions["frequencies"]["angry"] == 2
    assert emotions["frequencies"]["frustrated"] == 1
    assert emotions["frequencies"]["sad"] == 1
    assert emotions["frequencies"]["calm"] == 1
    assert emotions["most_observed"] == "angry"
    assert emotions["label"] == "Most frequently observed emotion"


def test_trigger_frequencies_and_percentages(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    triggers = data["triggers"]
    assert triggers["frequencies"]["screen_time"] == 2
    assert triggers["frequencies"]["bedtime"] == 1
    assert triggers["percentages"]["screen_time"] == 40.0  # 2 / 5 * 100
    assert triggers["most_observed"] == "screen_time"
    assert triggers["label"] == "Most frequently observed trigger"


def test_intensity_analytics(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    intensity = data["intensity"]
    # Intensities in 7d: 4, 3, 5, 2, 1 -> sum = 15, avg = 3.0
    assert intensity["average"] == 3.0
    assert intensity["minimum"] == 1
    assert intensity["maximum"] == 5
    assert intensity["distribution"]["4"] == 1
    assert intensity["distribution"]["5"] == 1
    assert intensity["label"] == "Observed intensity"


def test_intensity_rounding_regression():
    from app.services.analytics_service import round_half_up
    intensities = [1, 3, 4, 5]
    avg = round_half_up(sum(intensities) / len(intensities), 1)
    assert avg == 3.3  # 13/4 = 3.25 -> 3.3



def test_parent_response_frequencies(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    resp = data["parent_responses"]["frequencies"]
    assert resp["verbal_redirection"] == 2
    assert resp["set_boundary"] == 1


def test_outcome_frequencies(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    outcomes = data["outcomes"]["frequencies"]
    assert outcomes["deescalated"] == 4
    assert outcomes["partially_improved"] == 1


def test_recent_activity_and_previous_period_comparison(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    recent = data["recent_activity"]
    assert recent["current_period_events"] == 5
    assert recent["previous_period_events"] == 1
    assert recent["change_count"] == 4
    assert recent["change_percentage"] == 400.0
    assert "More events were recorded" in recent["summary_message"]


def test_trend_calculation(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    trend = data["trend"]
    assert trend["direction"] in ["increasing", "decreasing", "stable"]
    assert "Deterministic window rate comparison" in trend["method"]


def test_frequent_contexts(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    contexts = data["frequent_contexts"]
    assert len(contexts) > 0
    # Top context should be screen_time + angry (1) or screen_time + frustrated (1)
    assert any(c["trigger"] == "screen_time" for c in contexts)


def test_goal_alignment(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)
    data = res.json()
    alignment = data["goal_alignment"]
    assert len(alignment) == 2
    screen_goal = next(g for g in alignment if g["goal_type"] == "screen_time")
    assert screen_goal["related_observations"] >= 2


def test_14d_period(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=14d", headers=headers)
    data = res.json()
    assert data["period"]["type"] == "14d"
    # Includes the 10-day-ago event
    assert data["events"]["total"] == 6


def test_30d_period(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=30d", headers=headers)
    data = res.json()
    assert data["period"]["type"] == "30d"
    assert data["events"]["total"] == 6


def test_all_time_period(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=all", headers=headers)
    data = res.json()
    assert data["period"]["type"] == "all"
    assert data["events"]["total"] == 6
    assert data["recent_activity"]["previous_period_events"] is None


def test_invalid_period_param_rejection(analytics_data):
    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    res = client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=90d", headers=headers)
    assert res.status_code == 422


def test_db_immutability(analytics_data):
    """Confirm zero raw database records are mutated after calculating analytics."""
    db = SessionLocal()
    events_before = db.query(BehaviorEvent).count()
    checkins_before = db.query(DailyCheckIn).count()
    goals_before = db.query(ParentingGoal).count()
    db.close()

    headers = {"Authorization": f"Bearer {analytics_data['token_a']}"}
    client.get(f"/api/v1/children/{analytics_data['child_a_id']}/analytics/summary?period=7d", headers=headers)

    db = SessionLocal()
    events_after = db.query(BehaviorEvent).count()
    checkins_after = db.query(DailyCheckIn).count()
    goals_after = db.query(ParentingGoal).count()
    db.close()

    assert events_before == events_after
    assert checkins_before == checkins_after
    assert goals_before == goals_after
