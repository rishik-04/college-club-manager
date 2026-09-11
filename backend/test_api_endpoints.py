import sys
import os

sys.path.insert(0, r"C:\Users\KOTAGIRI RISHIK\.gemini\antigravity\scratch\college-club-manager\backend")

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    with TestClient(app) as client:
        print("--- 1. Testing Health & Root Endpoints ---")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print(" Root check passed")

        res = client.get("/api/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        print(" Health check passed")

        print("\n--- 2. Testing Authentication ---")
        res = client.post("/api/auth/login", json={"email": "student@college.edu", "password": "password123"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        res = client.post("/api/auth/login", json={"email": "admin@college.edu", "password": "admin123"})
        assert res.status_code == 200
        admin_token = res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(" Student and Admin auth verified")

        print("\n--- 3. Testing Native Application Submission & Kanban Board (Phase 26) ---")
        res = client.post(
            "/api/clubs/2/apply",
            headers=student_headers,
            json={
                "domain": "UI/UX & Graphic Design",
                "experience_level": "Advanced",
                "why_join": "I want to lead the design team for campus web apps.",
                "portfolio_url": "https://behance.net/alexrivera"
            }
        )
        assert res.status_code in [200, 201], f"Apply failed: {res.text}"
        app_id = res.json()["id"]
        print(f" Application #{app_id} submitted natively")

        res = client.get("/api/users/me/applications", headers=student_headers)
        assert res.status_code == 200
        my_apps = res.json()
        assert len(my_apps) >= 1
        print(f" My Applications endpoint returned {len(my_apps)} application(s)")

        res = client.put(
            f"/api/applications/{app_id}/status",
            headers=admin_headers,
            json={"status": "Interview Scheduled", "admin_notes": "Interview set for Friday at 3 PM"}
        )
        assert res.status_code == 200
        assert res.json()["status"] == "Interview Scheduled"
        print(" Kanban stage update ('Interview Scheduled') verified")

        print("\n--- 4. Testing Event Ticket Pass & Door Check-in (Phase 27) ---")
        res = client.post("/api/events/1/rsvp", headers=student_headers)
        assert res.status_code in [200, 201]
        ticket = res.json()
        ticket_code = ticket["ticket_code"]
        print(f" Issued Dynamic Ticket Pass code: {ticket_code}")

        res = client.post(
            "/api/events/1/check-in",
            headers=admin_headers,
            json={"ticket_code": ticket_code}
        )
        assert res.status_code == 200
        assert res.json()["status"] == "CHECKED_IN"
        print(" Door Check-in verified ('CHECKED_IN')")

        print("\n--- 5. Testing Campus Announcements Newsfeed (Phase 28) ---")
        res = client.post(
            "/api/clubs/1/announcements",
            headers=admin_headers,
            json={
                "title": "🎉 Welcome New Members!",
                "content": "First general body meeting scheduled for Monday in Main Auditorium.",
                "category": "Recruitment",
                "is_pinned": True
            }
        )
        assert res.status_code == 201
        print(" Announcement posted to newsfeed")

        res = client.get("/api/announcements")
        assert res.status_code == 200
        feed = res.json()
        assert len(feed) >= 1
        print(f" Newsfeed returned {len(feed)} announcement(s)")

        print("\n ALL ENTERPRISE END-TO-END TESTS PASSED SUCCESSFULLY! ")

if __name__ == "__main__":
    run_tests()
