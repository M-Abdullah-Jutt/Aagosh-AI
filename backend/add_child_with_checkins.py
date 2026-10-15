import os
import sys
import uuid
import random
import urllib.parse
from datetime import datetime, date, timedelta

# Add backend directory to sys.path
sys.path.append(r"e:\Agentic AI Projects\Aagosh AI\backend")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.child import Child, ChildProfile, ParentingGoal
from app.models.check_in import DailyCheckIn, BehaviorEvent

pwd = urllib.parse.quote_plus("CaxLB5P@+:/v_Md")
db_url = f"postgresql://postgres.xvejqsqdixrtppgrzzsc:{pwd}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

print("Connecting to DB...")
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    user = db.query(User).filter(User.email == "nocode392227@gmail.com").first()
    if not user:
        print("User not found!")
        sys.exit(1)

    print(f"User: {user.email} (ID: {user.id})")
    existing_children = db.query(Child).filter(Child.user_id == user.id).all()
    print("Existing children:", [c.first_name for c in existing_children])

    # Let's create child "Zayd" (or check if already exists)
    child_name = "Zayd"
    child = db.query(Child).filter(Child.user_id == user.id, Child.first_name == child_name).first()
    if not child:
        child = Child(
            id=str(uuid.uuid4()),
            user_id=user.id,
            first_name=child_name,
            date_of_birth=date(2021, 6, 15), # 4-5 years old
            gender="male"
        )
        db.add(child)
        db.flush()
        print(f"Created new child: {child.first_name} (ID: {child.id})")

        # Add profile
        profile = ChildProfile(
            id=str(uuid.uuid4()),
            child_id=child.id,
            strengths="Curious, loves outdoor play, very imaginative with Lego and building blocks, highly affectionate.",
            challenges="Finds bedtime routines and transitions away from play challenging; occasional stubbornness.",
            personality_notes="Energetic, warm-hearted, expressive.",
            communication_style="Responds best to visual cues, gentle countdowns before transitions, and choices."
        )
        db.add(profile)

        # Add goals
        goals = [
            ParentingGoal(
                id=str(uuid.uuid4()),
                child_id=child.id,
                goal_type="emotional_regulation",
                description="Help Zayd navigate big feelings during evening transitions calmly.",
                priority="high",
                is_active=True
            ),
            ParentingGoal(
                id=str(uuid.uuid4()),
                child_id=child.id,
                goal_type="positive_communication",
                description="Establish predictable bedtime routines with minimal resistance.",
                priority="medium",
                is_active=True
            )
        ]
        db.add_all(goals)
        db.flush()
    else:
        print(f"Found existing child: {child.first_name} (ID: {child.id})")

    # Clear existing check-ins for Zayd to ensure exactly 30 days
    existing_cis = db.query(DailyCheckIn).filter(DailyCheckIn.child_id == child.id).all()
    for ci in existing_cis:
        db.delete(ci)
    db.commit()

    # Generate 1 month (30 days) of realistic daily check-ins
    today = date.today()
    emotions = ["anger", "frustration", "anxiety", "sadness", "joy", "fear", "excitement", "overwhelm"]
    triggers = ["transitions", "screen_time", "homework", "sibling_conflict", "tiredness", "hunger", "unmet_needs"]
    responses = ["calm_redirection", "active_listening", "time_in", "boundary_setting", "natural_consequences", "raised_voice", "gave_in"]
    outcomes = ["de_escalated_quickly", "took_time_to_calm", "escalated", "compromise_reached", "connection_restored"]
    moods = ["calm", "energetic", "tired", "cranky", "anxious", "happy"]

    notes_templates = [
        "Had a smooth morning routine, but resisted turning off the TV before dinner.",
        "Very playful and cooperative today. Enjoyed park time and evening storytelling.",
        "Tired after preschool, needed extra connection time and cuddles before dinner.",
        "Practiced deep breathing together when feeling overwhelmed by sharing toys.",
        "Great bedtime cooperation tonight using the two-minute warning technique.",
        "Some resistance getting dressed in the morning, resolved with positive choices.",
        "Excited about kindergarten readiness activities and building blocks."
    ]

    print("Generating 30 days of check-ins...")
    total_events = 0
    for i in range(30):
        check_in_date = today - timedelta(days=i)
        ci = DailyCheckIn(
            id=str(uuid.uuid4()),
            child_id=child.id,
            check_in_date=check_in_date,
            overall_mood=random.choice(moods),
            general_notes=random.choice(notes_templates)
        )
        db.add(ci)
        db.flush()

        # Add 1 to 3 behavior events on most days
        num_events = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
        for _ in range(num_events):
            be = BehaviorEvent(
                id=str(uuid.uuid4()),
                check_in_id=ci.id,
                emotion=random.choice(emotions),
                intensity=random.randint(1, 5),
                trigger=random.choice(triggers),
                behavior_description="Felt challenged by routine shift; expressed big emotions verbally.",
                parent_response=random.choice(responses),
                outcome=random.choice(outcomes),
                event_notes="Discussed feelings afterwards and restored calm."
            )
            db.add(be)
            total_events += 1

    db.commit()
    print(f"SUCCESS: Created child '{child.first_name}' with 30 days of check-ins and {total_events} behavior events!")

except Exception as e:
    db.rollback()
    print("Error:", e)
    sys.exit(1)
finally:
    db.close()
