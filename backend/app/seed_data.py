import datetime
from sqlalchemy.orm import Session
from .models import User, Club, BoardMember, Event, SavedClub, Application, Ticket, Announcement
from .auth import hash_password

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Club).count() > 0:
        return

    print("Seeding College Club Manager database with Enterprise data...")

    # 1. Seed Users
    student_user = User(
        name="Alex Rivera",
        email="student@college.edu",
        password_hash=hash_password("password123"),
        role="STUDENT",
        branch="Computer Science & Engineering",
        year="3rd Year",
        interests="AI, Machine Learning, Python, Web Development, Hackathons, UI/UX"
    )
    admin_user = User(
        name="Dr. Sarah Jenkins",
        email="admin@college.edu",
        password_hash=hash_password("admin123"),
        role="SUPER_ADMIN",
        branch="Computer Science / Dean Office",
        year="Faculty Advisor",
        interests="Administration, Accreditation, Leadership"
    )
    club_admin_user = User(
        name="Marcus Chen",
        email="clubadmin@college.edu",
        password_hash=hash_password("clubadmin123"),
        role="CLUB_ADMIN",
        branch="Information Technology",
        year="4th Year",
        interests="Robotics, Embedded Systems, IoT"
    )

    db.add_all([student_user, admin_user, club_admin_user])
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
                {"name": "Sophia Martinez", "position": "Vice President & Research Lead", "photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"},
                {"name": "Rohan Verma", "position": "Technical Head", "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
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
                },
                {
                    "title": "Annual Campus Datathon 2025",
                    "description": "Over 200 participants competed over 24 hours to solve real-world healthcare and environmental vision problems.",
                    "event_date": now - datetime.timedelta(days=45),
                    "location": "Central Computing Lab",
                    "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
                    "is_past": True,
                    "registration_url": None
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
                {"name": "Liam Patel", "position": "Guild Lead", "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"},
                {"name": "Elena Rostova", "position": "Frontend Lead", "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"},
                {"name": "David Kim", "position": "Cloud & DevOps Lead", "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "HackWinter 48h Sprint",
                    "description": "Our premier flagship hackathon with $5,000+ in sponsor prizes, mentorship from FAANG alumni, and free pizza!",
                    "event_date": now + datetime.timedelta(days=22),
                    "location": "Innovation Hub & Student Center",
                    "image_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/hackwinter-reg"
                }
            ]
        }
    ]

    for cdata in clubs_data:
        board_members_data = cdata.pop("board_members")
        events_data = cdata.pop("events")

        club = Club(**cdata)
        db.add(club)
        db.flush()

        for bm in board_members_data:
            member = BoardMember(club_id=club.id, **bm)
            db.add(member)

        for ev in events_data:
            event = Event(club_id=club.id, **ev)
            db.add(event)

    db.commit()

    # Pre-seed saved clubs, sample applications, sample tickets, sample announcements
    ai_club = db.query(Club).filter(Club.name == "AI & Machine Learning Club").first()
    web_club = db.query(Club).filter(Club.name == "Full-Stack Web & Mobile Guild").first()
    first_event = db.query(Event).first()

    if ai_club and student_user:
        db.add(SavedClub(user_id=student_user.id, club_id=ai_club.id))

        # Sample Application
        app1 = Application(
            user_id=student_user.id,
            club_id=ai_club.id,
            domain="Technical / Machine Learning",
            experience_level="Intermediate",
            why_join="I want to contribute to the open-source LLM research project and mentor junior students.",
            portfolio_url="https://github.com/alexrivera-ai",
            status="Screening",
            admin_notes="Strong GitHub portfolio. Scheduled for technical interview on Friday.",
            created_at=now - datetime.timedelta(days=2)
        )
        db.add(app1)

        # Sample Announcement
        ann1 = Announcement(
            club_id=ai_club.id,
            title="🔥 Spring Recruitment Auditions Announced!",
            content="We are officially opening applications for Technical Leads, Project Managers, and Research Fellows. Deadline to submit your in-app application is October 15th!",
            category="Recruitment",
            is_pinned=True,
            created_at=now - datetime.timedelta(hours=5)
        )
        db.add(ann1)

    if web_club and student_user:
        ann2 = Announcement(
            club_id=web_club.id,
            title="📍 HackWinter Venue Updated to Innovation Lab 3",
            content="Please note that all registered teams for HackWinter sprint should check in at Room 302 by 9:00 AM.",
            category="Event",
            is_pinned=False,
            created_at=now - datetime.timedelta(hours=12)
        )
        db.add(ann2)

    if first_event and student_user:
        # Sample Ticket
        t1 = Ticket(
            user_id=student_user.id,
            event_id=first_event.id,
            ticket_code="CCM-AI2026X",
            status="REGISTERED",
            created_at=now - datetime.timedelta(days=1)
        )
        db.add(t1)

    db.commit()
    print("Enterprise database seeding completed successfully!")
