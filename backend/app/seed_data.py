import datetime
import random
from sqlalchemy.orm import Session
from .models import User, Club, BoardMember, Event, SavedClub, Announcement, ClubAdmin, ClubMembership
from .auth import hash_password

def seed_database(db: Session):
    if db.query(Club).count() > 0:
        return

    print("Seeding College Club Manager database with 3-tier Architecture & Real Demographics Data...")

    # Pre-compute bcrypt password hashes for all common combinations
    student_pw_hash = hash_password("password123")
    admin_pw_hash = hash_password("admin123")
    clubadmin_pw_hash = hash_password("clubadmin123")
    superadmin_pw_hash = hash_password("superadmin123")

    # 1. Seed Core Users (including email aliases so all login combinations work)
    student_user = User(
        name="Alex Rivera",
        email="student@college.edu",
        password_hash=student_pw_hash,
        role="STUDENT",
        branch="Computer Science & Engineering",
        year="3rd Year",
        section="Section A",
        interests="AI, Machine Learning, Python, Web Development, Hackathons, UI/UX"
    )
    student_user_alias = User(
        name="Alex Rivera",
        email="alex.rivera@college.edu",
        password_hash=student_pw_hash,
        role="STUDENT",
        branch="Computer Science & Engineering",
        year="3rd Year",
        section="Section A",
        interests="AI, Machine Learning, Python, Web Development, Hackathons, UI/UX"
    )

    admin_user = User(
        name="Dr. Sarah Jenkins",
        email="admin@college.edu",
        password_hash=admin_pw_hash,
        role="SUPER_ADMIN",
        branch="Computer Science / Dean Office",
        year="Faculty Advisor",
        section="Faculty",
        interests="Administration, Accreditation, Leadership"
    )
    admin_user_alias1 = User(
        name="Dr. Sarah Jenkins",
        email="superadmin@college.edu",
        password_hash=superadmin_pw_hash,
        role="SUPER_ADMIN",
        branch="Computer Science / Dean Office",
        year="Faculty Advisor",
        section="Faculty",
        interests="Administration, Accreditation, Leadership"
    )
    admin_user_alias2 = User(
        name="Dr. Sarah Jenkins",
        email="sarah.chen@college.edu",
        password_hash=admin_pw_hash,
        role="SUPER_ADMIN",
        branch="Computer Science / Dean Office",
        year="Faculty Advisor",
        section="Faculty",
        interests="Administration, Accreditation, Leadership"
    )

    club_admin_user = User(
        name="Marcus Chen",
        email="clubadmin@college.edu",
        password_hash=clubadmin_pw_hash,
        role="CLUB_ADMIN",
        branch="Information Technology",
        year="4th Year",
        section="Section B",
        interests="Robotics, Embedded Systems, IoT"
    )
    club_admin_user_alias1 = User(
        name="Marcus Chen",
        email="marcus.chen@college.edu",
        password_hash=admin_pw_hash,
        role="CLUB_ADMIN",
        branch="Information Technology",
        year="4th Year",
        section="Section B",
        interests="Robotics, Embedded Systems, IoT"
    )

    db.add_all([
        student_user, student_user_alias, 
        admin_user, admin_user_alias1, admin_user_alias2, 
        club_admin_user, club_admin_user_alias1
    ])
    db.commit()

    # Seed 150 student user profiles for rich realistic demographics calculations
    years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    year_weights = [0.35, 0.30, 0.20, 0.15]
    branches = ["Computer Science & Engineering", "Data Science", "Electronics & Communication", "Electrical & Electronics", "Mechanical Engineering"]
    branch_weights = [0.45, 0.25, 0.15, 0.10, 0.05]
    sections = ["Section A", "Section B", "Section C", "Section D"]

    first_names = ["Aarav", "Ananya", "Rohan", "Priya", "Rahul", "Neha", "Vikram", "Sneha", "Karan", "Kavya", "Aditya", "Riya", "Dev", "Pooja", "Siddharth", "Isha", "Arjun", "Tanya", "Varun", "Meera"]
    last_names = ["Sharma", "Verma", "Reddy", "Rao", "Patel", "Nair", "Gupta", "Kumar", "Singh", "Joshi", "Chowdary", "Deshmukh", "Kulkarni", "Mehta", "Bhat"]

    seeded_students = []
    for i in range(1, 151):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        name = f"{fn} {ln}"
        email = f"student{i}@college.edu"
        yr = random.choices(years, weights=year_weights)[0]
        br = random.choices(branches, weights=branch_weights)[0]
        sec = random.choice(sections)

        st = User(
            name=name,
            email=email,
            password_hash=student_pw_hash,
            role="STUDENT",
            branch=br,
            year=yr,
            section=sec,
            interests="Clubs, Tech, Events, Coding"
        )
        db.add(st)
        seeded_students.append(st)

    db.commit()

    now = datetime.datetime.utcnow()

    # 2. Seed Clubs
    clubs_data = [
        {
            "name": "AI & Machine Learning Club",
            "category": "Technical",
            "description": "The premier hub for artificial intelligence, deep learning, computer vision, and NLP enthusiasts on campus. We organize hands-on workshops, host international hackathons, and contribute to cutting-edge research publications.",
            "eligibility": "Open to all students across all branches and years. Fundamental knowledge of programming (Python/C++) is helpful but beginners with curiosity are encouraged to apply!",
            "outcomes": "Master modern ML frameworks (PyTorch, TensorFlow), build production AI applications, publish research papers, and compete in premier hackathons.",
            "logo_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-ai-club-application",
            "instagram_url": "https://instagram.com/college_aiclub",
            "linkedin_url": "https://linkedin.com/company/college-aiclub",
            "website_url": "https://aiclub.college.edu",
            "board_members": [
                {"name": "Aarav Sharma", "position": "President", "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"},
                {"name": "Sophia Martinez", "position": "Vice President & Research Lead", "photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "LLM & Generative AI Bootcamp",
                    "description": "A 3-day deep dive into building RAG systems and autonomous agent workflows using modern open-source models.",
                    "event_date": now + datetime.timedelta(days=14),
                    "location": "Auditorium Hall B & Virtual",
                    "image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/bootcamp-reg"
                }
            ]
        },
        {
            "name": "Full-Stack Web & Mobile Guild",
            "category": "Technical",
            "description": "We are creators who ship software. From modern web development (React, Next.js, FastAPI, Node) to cross-platform mobile apps (React Native, Flutter), we build real products used by students and local organizations.",
            "eligibility": "Passionate about code, design, or product management. All skill tiers welcomed with dedicated tracks for beginners and senior architects.",
            "outcomes": "Deploy live production applications to your portfolio, master Git workflows, understand modern cloud deployment, and prepare for tech interviews.",
            "logo_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-devguild-application",
            "instagram_url": "https://instagram.com/college_devguild",
            "linkedin_url": "https://linkedin.com/company/college-devguild",
            "website_url": "https://devguild.college.edu",
            "board_members": [
                {"name": "Liam Patel", "position": "Guild Lead", "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "HackWinter 48h Sprint",
                    "description": "Our premier flagship hackathon with $5,000+ in sponsor prizes and FAANG mentorship!",
                    "event_date": now + datetime.timedelta(days=22),
                    "location": "Innovation Hub",
                    "image_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/hackwinter-reg"
                }
            ]
        },
        {
            "name": "The Infinitix Club",
            "category": "Technical",
            "description": "Innovated by the Data Science (DS) Department at Sreenidhi Institute of Science and Technology. Guided by our motto 'Igniting Insights from Data', we bridge academic learning and industry innovation through flagship hackathons, data analytics projects, and hands-on technical workshops.",
            "eligibility": "Open to all students across all branches and years interested in Data Science, Machine Learning, Artificial Intelligence, and Data Analytics.",
            "outcomes": "Gain hands-on expertise in Data Science pipelines, participate in flagship hackathons (AVINYA '25, HACK THE MATRIX), build real-world data applications, and collaborate with leading industry experts.",
            "logo_url": "/infinitix_logo.jpg",
            "cover_url": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/infinitix-club-application",
            "instagram_url": "https://instagram.com/infinitix_club",
            "linkedin_url": "https://linkedin.com/in/infinitix-club-snist",
            "website_url": "https://infinitix.snist.edu.in",
            "board_members": [
                {"name": "Kaushik Surapalli", "position": "President", "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"},
                {"name": "Dheeraj Reddy", "position": "General Secretary", "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"},
                {"name": "Amulya", "position": "Public Relations", "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"},
                {"name": "Uttej Mekala", "position": "Documentation Head", "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"},
                {"name": "G Sai Bharath", "position": "Organizing Head", "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"},
                {"name": "Chandradeep", "position": "Designing Head", "photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"},
                {"name": "Akshay D", "position": "Publicity Head", "photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"},
                {"name": "Devi Kanukula", "position": "Marketing Head", "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Major Project Expo 2025",
                    "description": "Annual flagship exhibition showcasing innovative senior data science, machine learning, and AI projects.",
                    "event_date": now - datetime.timedelta(days=60),
                    "location": "DS Department Main Auditorium",
                    "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
                    "is_past": True,
                    "registration_url": "https://forms.google.com/infinitix-expo-2025"
                },
                {
                    "title": "Department Level Hackathon AVINYA 25",
                    "description": "Intense 24-hour department-level hackathon solving real-world challenges in data analytics and predictive modeling.",
                    "event_date": now - datetime.timedelta(days=30),
                    "location": "DS Innovation Lab & Seminar Hall",
                    "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
                    "is_past": True,
                    "registration_url": "https://forms.google.com/avinya-25"
                },
                {
                    "title": "HACK THE MATRIX Hackathon",
                    "description": "Upcoming national-level hackathon empowering participants to hack problems using AI, Big Data, and Cyber Systems.",
                    "event_date": now + datetime.timedelta(days=18),
                    "location": "Campus Central Auditorium & Virtual",
                    "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/hack-the-matrix"
                }
            ]
        }
    ]

    created_clubs = []
    for cdata in clubs_data:
        board_members_data = cdata.pop("board_members")
        events_data = cdata.pop("events")

        club = Club(**cdata)
        db.add(club)
        db.flush()
        created_clubs.append(club)

        for bm in board_members_data:
            member = BoardMember(club_id=club.id, **bm)
            db.add(member)

        for ev in events_data:
            event = Event(club_id=club.id, **ev)
            db.add(event)

    db.commit()

    ai_club = db.query(Club).filter(Club.name == "AI & Machine Learning Club").first()
    web_club = db.query(Club).filter(Club.name == "Full-Stack Web & Mobile Guild").first()
    infinitix_club = db.query(Club).filter(Club.name == "The Infinitix Club").first()

    if ai_club and club_admin_user:
        db.add(ClubAdmin(user_id=club_admin_user.id, club_id=ai_club.id))

    if ai_club and student_user:
        db.add(SavedClub(user_id=student_user.id, club_id=ai_club.id))
        db.add(ClubMembership(student_id=student_user.id, club_id=ai_club.id))

        ann1 = Announcement(
            club_id=ai_club.id,
            title="🔥 Spring Recruitment & Workshop Registration!",
            content="We are officially opening applications for Technical Leads and Research Fellows. Click the Application Form tab to fill out our official Google Form!",
            category="Recruitment",
            is_pinned=True,
            created_at=now - datetime.timedelta(hours=5)
        )
        db.add(ann1)

    if web_club:
        ann2 = Announcement(
            club_id=web_club.id,
            title="📍 HackWinter Venue Updated to Innovation Lab 3",
            content="Please note that all registered teams for HackWinter sprint should check in at Room 302 by 9:00 AM.",
            category="Event",
            is_pinned=False,
            created_at=now - datetime.timedelta(hours=12)
        )
        db.add(ann2)

    # 3. Seed Club Memberships for Demographics (AI Club gets 142 members, Web Guild gets 85, Infinitix gets 95)
    all_students_ids = [s.id for s in seeded_students]

    # AI Club Memberships
    ai_members = all_students_ids[:142]
    for s_id in ai_members:
        db.add(ClubMembership(student_id=s_id, club_id=ai_club.id))

    # Web Guild Memberships
    web_members = all_students_ids[30:115]
    for s_id in web_members:
        db.add(ClubMembership(student_id=s_id, club_id=web_club.id))

    # Infinitix Memberships
    infinitix_members = all_students_ids[50:145]
    for s_id in infinitix_members:
        db.add(ClubMembership(student_id=s_id, club_id=infinitix_club.id))

    db.commit()
    print("Database seeding completed successfully with 3-tier architecture and real student demographics!")
