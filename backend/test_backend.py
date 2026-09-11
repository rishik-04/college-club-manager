import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, r"C:\Users\KOTAGIRI RISHIK\.gemini\antigravity\scratch\college-club-manager\backend")

from app.database import engine, Base, SessionLocal
from app.models import User, Club, BoardMember, Event, SavedClub
from app.seed_data import seed_database
from app.auth import verify_password, create_access_token

print("Step 1: Creating database tables...")
Base.metadata.create_all(bind=engine)

print("Step 2: Running seed database...")
db = SessionLocal()
seed_database(db)

clubs_count = db.query(Club).count()
users_count = db.query(User).count()
events_count = db.query(Event).count()
members_count = db.query(BoardMember).count()
saved_count = db.query(SavedClub).count()

print(f"Clubs count: {clubs_count}")
print(f"Users count: {users_count}")
print(f"Events count: {events_count}")
print(f"Board members count: {members_count}")
print(f"Saved clubs count: {saved_count}")

student = db.query(User).filter(User.email == "student@college.edu").first()
assert student is not None
assert verify_password("password123", student.password_hash) is True
print("Student auth verified successfully!")

token = create_access_token({"sub": str(student.id), "role": student.role})
print(f"Generated JWT token for student: {token[:25]}...")

db.close()
print("ALL BACKEND VERIFICATION CHECKS PASSED!")
