import sys
import os
import datetime

# Add current backend dir to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import engine, Base, SessionLocal
from app.models import User, Club, Announcement
from app.seed_data import seed_database

print("--- TESTING ANNOUNCEMENTS AND FEATURE FUNCTIONALITY ---")

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Ensure seed data
seed_database(db)

# 1. Test campus-wide announcement creation (club_id=None)
print("\n[TEST 1] Creating Campus-Wide Announcement (club_id=None)...")
campus_ann = Announcement(
    club_id=None,
    title="Official Campus Announcement: Spring Registration Open",
    content="All students are invited to register for upcoming club activities and workshops.",
    category="General",
    is_pinned=True,
    created_at=datetime.datetime.utcnow()
)
db.add(campus_ann)
db.commit()
db.refresh(campus_ann)

assert campus_ann.id is not None
assert campus_ann.club_id is None
assert campus_ann.is_pinned is True
print(f"SUCCESS: Created campus announcement ID {campus_ann.id}, title: '{campus_ann.title}'")

# 2. Test club-specific announcement creation
print("\n[TEST 2] Creating Club-Specific Announcement...")
first_club = db.query(Club).first()
assert first_club is not None

club_ann = Announcement(
    club_id=first_club.id,
    title=f"Important Update for {first_club.name}",
    content="Weekly team meeting rescheduled to Friday 5 PM.",
    category="Notice",
    is_pinned=False,
    created_at=datetime.datetime.utcnow()
)
db.add(club_ann)
db.commit()
db.refresh(club_ann)

assert club_ann.id is not None
assert club_ann.club_id == first_club.id
print(f"SUCCESS: Created club announcement ID {club_ann.id} for club '{first_club.name}'")

# 3. Test Pin / Unpin toggle
print("\n[TEST 3] Testing Pin / Unpin Toggle...")
club_ann.is_pinned = not club_ann.is_pinned
db.commit()
db.refresh(club_ann)
assert club_ann.is_pinned is True
print(f"SUCCESS: Toggled announcement ID {club_ann.id} is_pinned to True")

# 4. Test query ordering (pinned first, then newest)
print("\n[TEST 4] Testing Announcement Feed Query Ordering...")
announcements = db.query(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()
assert len(announcements) >= 2
assert announcements[0].is_pinned is True
print("SUCCESS: Pinned announcements ordered at top of feed!")

# 5. Check google_form_url property on clubs
print("\n[TEST 5] Checking Google Form URL on Clubs...")
clubs_with_form = db.query(Club).filter(Club.google_form_url.isnot(None)).all()
print(f"Found {len(clubs_with_form)} clubs with google_form_url configured.")

# 6. Test Club Activate / Deactivate functionality
print("\n[TEST 6] Testing Club Activate / Deactivate Status Toggle...")
target_club = db.query(Club).first()
assert target_club.is_active is True
target_club.is_active = False
db.commit()
db.refresh(target_club)
assert target_club.is_active is False

# Ensure active filter excludes deactivated club
active_clubs = db.query(Club).filter(Club.is_active == True).all()
assert target_club.id not in [c.id for c in active_clubs]
print(f"SUCCESS: Deactivated club ID {target_club.id}, verified excluded from active student query!")

target_club.is_active = True
db.commit()
db.refresh(target_club)
assert target_club.is_active is True
print(f"SUCCESS: Re-activated club ID {target_club.id}!")

db.close()
print("\nALL BACKEND ANNOUNCEMENT AND FEATURE VERIFICATION TESTS PASSED SUCCESSFULLY!")
