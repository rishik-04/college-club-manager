import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.models import User, Club, ClubAdmin, ClubMembership
from fastapi.testclient import TestClient
from app.main import app

# Reset Database
print("Initializing test database...")
engine.dispose()
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

print("\n--- TEST 1: Authentication ---")
res_student = client.post("/api/auth/login", json={"email": "student@college.edu", "password": "password123"})
assert res_student.status_code == 200, f"Student login failed: {res_student.text}"
student_token = res_student.json()["access_token"]
print("[OK] Student Login Success")

res_club_admin = client.post("/api/auth/login", json={"email": "clubadmin@college.edu", "password": "clubadmin123"})
assert res_club_admin.status_code == 200, f"Club admin login failed: {res_club_admin.text}"
club_admin_token = res_club_admin.json()["access_token"]
print("[OK] Club Admin Login Success")

res_super_admin = client.post("/api/auth/login", json={"email": "admin@college.edu", "password": "admin123"})
assert res_super_admin.status_code == 200, f"Super admin login failed: {res_super_admin.text}"
super_admin_token = res_super_admin.json()["access_token"]
print("[OK] Super Admin Login Success")

print("\n--- TEST 2: Demographics Analytics API ---")
res_analytics = client.get("/api/clubs/1/analytics")
assert res_analytics.status_code == 200, f"Analytics failed: {res_analytics.text}"
analytics_data = res_analytics.json()
print(f"[OK] Total Members for Club 1: {analytics_data['total_members']}")
print(f"[OK] Year Distribution: {analytics_data['year_distribution']}")
print(f"[OK] Branch Distribution: {analytics_data['branch_distribution']}")
print(f"[OK] Section Distribution: {analytics_data['section_distribution']}")
assert analytics_data['total_members'] > 0, "Demographics members count should be > 0"

print("\n--- TEST 3: Club Membership Roster & Duplicate Rejection (409 Conflict) ---")
headers_admin = {"Authorization": f"Bearer {club_admin_token}"}
# Get roster
res_roster = client.get("/api/clubs/1/members")
assert res_roster.status_code == 200, f"Get roster failed: {res_roster.text}"
roster = res_roster.json()
print(f"[OK] Roster count: {len(roster)}")

# Try adding an existing member to trigger 409 Conflict
first_student_id = roster[0]["student_id"]
res_dup = client.post("/api/clubs/1/members", json={"student_id": first_student_id}, headers=headers_admin)
assert res_dup.status_code == 409, f"Expected 409 Conflict for duplicate membership, got: {res_dup.status_code}"
print("[OK] Duplicate membership correctly rejected with 409 Conflict")

print("\n--- TEST 4: RBAC 403 Forbidden Enforcement ---")
# Club Admin is assigned to Club 1. Try modifying Club 2
res_unauthorized = client.put(
    "/api/clubs/2",
    json={"description": "Unauthorized attempt to modify unassigned club"},
    headers=headers_admin
)
assert res_unauthorized.status_code == 403, f"Expected 403 Forbidden for unauthorized club access, got: {res_unauthorized.status_code}"
print("[OK] Strict RBAC 403 Forbidden check passed for unassigned club modification")

print("\n--- TEST 5: Super Admin Assignment & Global Stats ---" )
headers_super = {"Authorization": f"Bearer {super_admin_token}"}
res_stats = client.get("/api/admin/stats", headers=headers_super)
assert res_stats.status_code == 200, f"Admin stats failed: {res_stats.text}"
print(f"[OK] Global Stats Total Clubs: {res_stats.json()['total_clubs']}")
print(f"[OK] Global Stats Total Students: {res_stats.json()['total_students']}")

print("\n==========================================")
print("ALL BACKEND SUITE TESTS PASSED CLEANLY!")
print("==========================================")
