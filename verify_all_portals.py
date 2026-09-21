import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_all():
    print("=== STARTING QA PASSOVER & API VERIFICATION ===")

    # 1. Login as Student
    s_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "student@college.edu", "password": "password123"})
    if s_login.status_code != 200:
        print(f"FAILED Student Login: {s_login.status_code} {s_login.text}")
        sys.exit(1)
    student_token = s_login.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[OK] Student Login PASS")

    # 2. Login as Club Admin
    ca_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "clubadmin@college.edu", "password": "clubadmin123"})
    if ca_login.status_code != 200:
        print(f"FAILED Club Admin Login: {ca_login.status_code} {ca_login.text}")
        sys.exit(1)
    ca_token = ca_login.json()["access_token"]
    ca_headers = {"Authorization": f"Bearer {ca_token}"}
    print("[OK] Club Admin Login PASS")

    # 3. Login as Super Admin
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@college.edu", "password": "admin123"})
    if admin_login.status_code != 200:
        print(f"FAILED Super Admin Login: {admin_login.status_code} {admin_login.text}")
        sys.exit(1)
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] Super Admin Login PASS")

    # 4. Explore & Clubs
    clubs_res = requests.get(f"{BASE_URL}/clubs", headers=student_headers)
    assert clubs_res.status_code == 200 and isinstance(clubs_res.json(), list)
    print(f"[OK] GET /api/clubs PASS ({len(clubs_res.json())} clubs found)")

    # 5. Events List & Registration Status
    events_res = requests.get(f"{BASE_URL}/events", headers=student_headers)
    assert events_res.status_code == 200 and isinstance(events_res.json(), list)
    events = events_res.json()
    print(f"[OK] GET /api/events PASS ({len(events)} events found)")

    if len(events) > 0:
        target_event = events[0]
        reg_res = requests.post(f"{BASE_URL}/events/{target_event['id']}/register", headers=student_headers)
        assert reg_res.status_code in [200, 201, 400] # 400 if already registered
        print(f"[OK] POST /api/events/{target_event['id']}/register PASS ({reg_res.json()})")

    # 6. Notifications Endpoint
    notif_res = requests.get(f"{BASE_URL}/notifications", headers=student_headers)
    assert notif_res.status_code == 200 and isinstance(notif_res.json(), list)
    print(f"[OK] GET /api/notifications PASS ({len(notif_res.json())} notices found)")

    # 7. Club Admin My Club
    my_club_res = requests.get(f"{BASE_URL}/admin/my-club", headers=ca_headers)
    assert my_club_res.status_code == 200
    my_club = my_club_res.json()
    print(f"[OK] GET /api/admin/my-club PASS (Club: {my_club['name']})")

    # 8. Create Announcement for Club Admin
    ann_res = requests.post(
        f"{BASE_URL}/clubs/{my_club['id']}/announcements",
        headers=ca_headers,
        json={"title": "Verification Notice", "content": "Testing notification and refresh flow", "category": "General", "is_pinned": False}
    )
    assert ann_res.status_code == 201
    ann = ann_res.json()
    print(f"[OK] POST /api/clubs/{my_club['id']}/announcements PASS")

    # Clean up verification announcement so DB stays pristine
    del_ann = requests.delete(f"{BASE_URL}/announcements/{ann['id']}", headers=ca_headers)
    assert del_ann.status_code == 204
    print("[OK] Cleaned up verification announcement")

    # 9. Club Admin Membership Analytics
    ana_res = requests.get(f"{BASE_URL}/clubs/{my_club['id']}/analytics", headers=ca_headers)
    assert ana_res.status_code == 200
    ana = ana_res.json()
    print(f"[OK] GET /api/clubs/{my_club['id']}/analytics PASS (Keys: {list(ana.keys())})")

    # 10. Super Admin Global Analytics
    global_ana = requests.get(f"{BASE_URL}/admin/stats", headers=admin_headers)
    if global_ana.status_code != 200:
        print(f"FAILED GET /api/admin/stats: {global_ana.status_code} {global_ana.text}")
    assert global_ana.status_code == 200
    print("[OK] GET /api/admin/stats PASS")

    print("\nALL BACKEND API AND DATA SHAPE CHECKS PASSED PERFECTLY!")

if __name__ == '__main__':
    test_all()
