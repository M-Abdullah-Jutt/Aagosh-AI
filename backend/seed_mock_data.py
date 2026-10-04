import os
import sys
import uuid
import random
import urllib.parse
from datetime import datetime, date, timedelta

# Add backend directory to sys.path so we can import app modules
sys.path.append(r"e:\Agentic AI Projects\Aagosh AI\backend")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.child import Child
from app.models.check_in import DailyCheckIn, BehaviorEvent
from dotenv import load_dotenv

# Provide URL-encoded connection string directly
pwd = urllib.parse.quote_plus("CaxLB5P@+:/v_Md")
db_url = f"postgresql://postgres.xvejqsqdixrtppgrzzsc:{pwd}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

print("Connecting to DB:", db_url)
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # 1. Find User
    user = db.query(User).filter(User.email == "nocode392227@gmail.com").first()
    if not user:
        print("User not found!")
        sys.exit(1)
    
    print(f"Found user: {user.id}")

    # 2. Find Child
    child = db.query(Child).filter(Child.user_id == user.id, Child.first_name == "Areeba").first()
    if not child:
        print("Child not found!")
        sys.exit(1)
    
    print(f"Found child Areeba: {child.id}")

    # 3. Create Mock Data
    today = date.today()
    
    emotions = ["anger", "frustration", "anxiety", "sadness", "joy", "fear", "excitement", "overwhelm"]
    triggers = ["transitions", "screen_time", "homework", "sibling_conflict", "tiredness", "hunger", "unmet_needs"]
    responses = ["calm_redirection", "active_listening", "time_in", "boundary_setting", "natural_consequences", "raised_voice", "gave_in"]
    outcomes = ["de_escalated_quickly", "took_time_to_calm", "escalated", "compromise_reached", "connection_restored"]
    moods = ["calm", "energetic", "tired", "cranky", "anxious", "happy"]

    # Delete existing mock data to avoid duplicates if run multiple times
    existing_check_ins = db.query(DailyCheckIn).filter(DailyCheckIn.child_id == child.id).all()
    for ci in existing_check_ins:
        db.delete(ci)
    db.commit()

    print("Cleared old check-ins for Areeba.")

    # Let's make sure we have enough data to generate rich analytics
    for i in range(14):
        check_in_date = today - timedelta(days=i)
        
        # 80% chance to have a check-in on any day
        if random.random() > 0.8:
            continue
            
        ci = DailyCheckIn(
            id=str(uuid.uuid4()),
            child_id=child.id,
            check_in_date=check_in_date,
            overall_mood=random.choice(moods),
            general_notes=f"Mock note for day {i}"
        )
        db.add(ci)
        db.flush() # flush to get the ci.id

        # Add 1 to 4 behavior events per check-in
        num_events = random.randint(1, 4)
        for _ in range(num_events):
            be = BehaviorEvent(
                id=str(uuid.uuid4()),
                check_in_id=ci.id,
                emotion=random.choice(emotions),
                intensity=random.randint(1, 5),
                trigger=random.choice(triggers),
                behavior_description="Mock behavior description.",
                parent_response=random.choice(responses),
                outcome=random.choice(outcomes),
                event_notes="Mock notes."
            )
            db.add(be)
    
    db.commit()
    print("Successfully generated mock check-ins and behavior events for Areeba.")

except Exception as e:
    db.rollback()
    print("Error:", e)
finally:
    db.close()
