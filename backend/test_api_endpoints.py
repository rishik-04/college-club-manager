import sys
import os

sys.path.insert(0, r"C:\Users\KOTAGIRI RISHIK\.gemini\antigravity\scratch\college-club-manager\backend")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Health & Root Endpoints ---")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print(" Root check passed")

    res = client.get("/api/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print(" Health check passed")

    print("\n--- 2. Testing Authentication ---")
    # Login student
    res = client.post("/api/auth/login", json={"email": "student@college.edu", "password": "password123"})
    assert res.status_code == 200, f"Student login failed: {res.text}"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print(" Student login passed, JWT token received")

    # Login admin
    res = client.post("/api/auth/login", json={"email": "admin@college.edu", "password": "admin123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" Admin login passed, JWT token received")

    # Verify /me endpoint
    res = client.get("/api/auth/me", headers=student_headers)
    assert res.status_code == 200 and res.json()["email"] == "student@college.edu"
    print(" Student /me endpoint verified")

    print("\n--- 3. Testing Clubs & Search/Filters ---")
    res = client.get("/api/clubs")
    assert res.status_code == 200
    clubs = res.json()
    assert len(clubs) >= 10, f"Expected >= 10 clubs, got {len(clubs)}"
    print(f" Loaded {len(clubs)} clubs successfully")

    # Search filter
    res = client.get("/api/clubs?search=AI")
    assert res.status_code == 200
    search_results = res.json()
    assert any("AI" in c["name"] for c in search_results)
    print(f" Search query '?search=AI' returned {len(search_results)} match(es)")

    # Category filter
    res = client.get("/api/clubs?category=Technical")
    assert res.status_code == 200
    tech_clubs = res.json()
    assert all(c["category"] == "Technical" for c in tech_clubs)
    print(f" Category filter '?category=Technical' returned {len(tech_clubs)} clubs")

    print("\n--- 4. Testing Club Details (Board Members & Events) ---")
    first_club_id = clubs[0]["id"]
    res = client.get(f"/api/clubs/{first_club_id}")
    assert res.status_code == 200
    details = res.json()
    assert "board_members" in details and len(details["board_members"]) > 0
    assert "google_form_url" in details
    print(f" Club details verified with {len(details['board_members'])} board members")

    print("\n--- 5. Testing Saved Clubs (Shortlist Toggle) ---")
    # Save club
    res = client.post(f"/api/users/me/saved-clubs/{first_club_id}", headers=student_headers)
    assert res.status_code in [200, 201]

    # Get saved list
    res = client.get("/api/users/me/saved-clubs", headers=student_headers)
    assert res.status_code == 200
    saved_list = res.json()
    assert any(s["club_id"] == first_club_id for s in saved_list)
    print(f" Saved clubs list verified with {len(saved_list)} saved items")

    # Unsave club
    res = client.delete(f"/api/users/me/saved-clubs/{first_club_id}", headers=student_headers)
    assert res.status_code == 200
    print(" Unsave club verified")

    print("\n--- 6. Testing Events Feed ---")
    res = client.get("/api/events?filter_type=upcoming")
    assert res.status_code == 200
    upcoming = res.json()
    print(f" Upcoming events feed returned {len(upcoming)} items")

    res = client.get("/api/events?filter_type=past")
    assert res.status_code == 200
    past = res.json()
    print(f" Past events feed returned {len(past)} items")

    print("\n--- 7. Testing AI Smart Match & Q&A Assistant ---")
    # Match recommendation
    res = client.post("/api/ai/recommend", json={"interests": ["Python", "AI", "Machine Learning", "Hackathons"]})
    assert res.status_code == 200
    recommendations = res.json()
    assert len(recommendations) > 0
    top_match = recommendations[0]
    print(f" Top AI match: {top_match['club']['name']} with score {top_match['match_score']}%")

    # Ask Assistant
    res = client.post("/api/ai/ask", json={"question": "Which clubs are related to AI?"})
    assert res.status_code == 200
    answer_data = res.json()
    assert len(answer_data["answer"]) > 10
    print(f" AI Advisor Answer: {answer_data['answer'][:80]}...")

    print("\n--- 8. Testing Admin Portal & Stats ---")
    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_clubs"] >= 10
    assert stats["upcoming_events"] >= 1
    print(f" Admin stats verified: {stats['total_clubs']} clubs, {stats['total_students']} students, {stats['upcoming_events']} upcoming events")

    print("\n ALL END-TO-END TESTS PASSED SUCCESSFULLY! ")

if __name__ == "__main__":
    run_tests()
