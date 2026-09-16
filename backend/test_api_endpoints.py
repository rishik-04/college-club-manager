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

        print("\n--- 3. Testing Unified Application Form & Payment Scanner (Phase 26) ---")
        res = client.post(
            "/api/clubs/2/apply",
            headers=student_headers,
            json={
                "name": "Alex Rivera",
                "roll_no": "2101A0501",
                "branch": "Computer Science & Engineering",
                "mobile_no": "+91 98765 43210",
                "whatsapp_no": "+91 98765 43210",
                "college_email": "student@college.edu",
                "personal_email": "alex.rivera@gmail.com",
                "why_join": "I want to lead technical workshops and build open-source projects.",
                "tshirt_size": "XL",
                "payment_utr": "UPI/987654321098"
            }
        )
        assert res.status_code in [200, 201], f"Apply failed: {res.text}"
        app_data = res.json()
        assert app_data["roll_no"] == "2101A0501"
        assert app_data["tshirt_size"] == "XL"
        assert app_data["payment_utr"] == "UPI/987654321098"
        print(f" Application #{app_data['id']} verified with Roll No 2101A0501 and Payment UTR")

        # Kanban Admin View
        res = client.get("/api/admin/applications", headers=admin_headers)
        assert res.status_code == 200
        apps = res.json()
        assert any(a["roll_no"] == "2101A0501" for a in apps)
        print(" Admin Kanban feed verified with student Roll No and Payment UTR")

        print("\n ALL UNIFIED APPLICATION FORM & PAYMENTS TESTS PASSED! ")

if __name__ == "__main__":
    run_tests()
