import datetime
from sqlalchemy.orm import Session
from .models import User, Club, BoardMember, Event, SavedClub
from .auth import hash_password

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Club).count() > 0:
        return

    print("Seeding College Club Manager database...")

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
                },
                {
                    "title": "Intro to Docker & Microservices Workshop",
                    "description": "Hands-on session teaching containerization, compose architectures, and zero-downtime deployment pipelines.",
                    "event_date": now - datetime.timedelta(days=30),
                    "location": "Seminar Hall 3",
                    "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80",
                    "is_past": True,
                    "registration_url": None
                }
            ]
        },
        {
            "name": "Robotics & Automation Society",
            "category": "Technical",
            "description": "Where hardware meets software. We design autonomous rovers, drone swarms, combat robots, and industrial automation prototypes. We represent the college in national and international robotics leagues.",
            "eligibility": "Students from Mechanical, Electronics, Mechatronics, CS, and all curious makers. Willingness to get your hands dirty in the lab.",
            "outcomes": "Master embedded systems (ROS, Arduino, STM32), PCB design in KiCAD, 3D CAD modeling, and motor telemetry control.",
            "logo_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-robotics-application",
            "instagram_url": "https://instagram.com/college_robotics",
            "linkedin_url": "https://linkedin.com/company/college-robotics",
            "website_url": "https://robotics.college.edu",
            "board_members": [
                {"name": "Marcus Chen", "position": "Captain & Hardware Lead", "photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"},
                {"name": "Priya Nair", "position": "Software & Firmware Lead", "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "RoboWars 2026: Campus Championship",
                    "description": "High-octane 15kg & 30kg combat robot battles in our custom polycarbonate battle arena.",
                    "event_date": now + datetime.timedelta(days=35),
                    "location": "Open Amphitheatre",
                    "image_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/robowars-reg"
                }
            ]
        },
        {
            "name": "E-Cell (Entrepreneurship Cell)",
            "category": "Entrepreneurship",
            "description": "Fostering the next generation of founders, disruptors, and venture builders. We connect student startups with angel investors, seed funding, incubators, and seasoned industry mentors.",
            "eligibility": "Anyone with ambition, an innovative idea, or a passion for marketing, business models, finance, and leadership. No prior startup experience required.",
            "outcomes": "Learn pitch deck creation, financial forecasting, investor relations, IP filing, and gain access to our $50,000 campus venture fund.",
            "logo_url": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-ecell-application",
            "instagram_url": "https://instagram.com/college_ecell",
            "linkedin_url": "https://linkedin.com/company/college-ecell",
            "website_url": "https://ecell.college.edu",
            "board_members": [
                {"name": "Ananya Rao", "position": "Convener", "photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"},
                {"name": "Devansh Gupta", "position": "Incubation Manager", "photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Campus Shark Tank: Pitch & Seed",
                    "description": "Top 10 student startups pitch live in front of venture capitalists for up to $25k in non-dilutive grant awards.",
                    "event_date": now + datetime.timedelta(days=18),
                    "location": "Auditorium Main Stage",
                    "image_url": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/sharktank-reg"
                }
            ]
        },
        {
            "name": "Design & UI/UX Guild",
            "category": "Creative",
            "description": "The creative epicenter for product designers, visual artists, 3D animators, and design system enthusiasts. We bridge the gap between human empathy and digital craftsmanship.",
            "eligibility": "Passionate about aesthetic, user psychology, Figma, Blender, typography, or branding. Open to all students.",
            "outcomes": "Build an industry-standard design portfolio, master Figma auto-layout and prototyping, conduct user research, and collaborate with tech clubs.",
            "logo_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-design-application",
            "instagram_url": "https://instagram.com/college_designguild",
            "linkedin_url": "https://linkedin.com/company/college-designguild",
            "website_url": "https://design.college.edu",
            "board_members": [
                {"name": "Chloe Dupont", "position": "Creative Director", "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"},
                {"name": "Arjun Saxena", "position": "UI/UX Lead", "photo_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Designathon: Redesigning Campus Living",
                    "description": "A 12-hour design challenge focused on redesigning the college library and dining portal experience.",
                    "event_date": now + datetime.timedelta(days=28),
                    "location": "Design Lab 102",
                    "image_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/designathon-reg"
                }
            ]
        },
        {
            "name": "Rotaract & Community Outreach",
            "category": "Social",
            "description": "Dedicated to community welfare, youth empowerment, rural education, blood donation drives, and environmental sustainability campaigns across our state.",
            "eligibility": "Any student driven by empathy, community spirit, and a desire to make a tangible difference in society.",
            "outcomes": "Develop grass-roots leadership skills, volunteer certificates recognized globally, project management experience, and lifelong friendships.",
            "logo_url": "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-rotaract-application",
            "instagram_url": "https://instagram.com/college_rotaract",
            "linkedin_url": "https://linkedin.com/company/college-rotaract",
            "website_url": "https://rotaract.college.edu",
            "board_members": [
                {"name": "Meera Joshi", "position": "Club President", "photo_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"},
                {"name": "Tariq Mansoor", "position": "Community Projects Lead", "photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Mega Blood & Health Donation Camp",
                    "description": "Collaborating with Red Cross to provide free health screenings and collect over 300 units of blood.",
                    "event_date": now + datetime.timedelta(days=7),
                    "location": "Student Activity Center",
                    "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/bloodcamp-reg"
                }
            ]
        },
        {
            "name": "Aperture Photography & Film Society",
            "category": "Creative",
            "description": "Capturing campus memories, storytelling through cinematic lenses, street photography walks, documentary productions, and visual grading workshops.",
            "eligibility": "Phone photographers to DSLR enthusiasts. All levels welcomed! Camera equipment provided for club shoots.",
            "outcomes": "Learn Lightroom & DaVinci Resolve editing, studio lighting mastery, and build a creative cinematography reel.",
            "logo_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-aperture-application",
            "instagram_url": "https://instagram.com/college_aperture",
            "linkedin_url": "https://linkedin.com/company/college-aperture",
            "website_url": "https://aperture.college.edu",
            "board_members": [
                {"name": "Karthik Raja", "position": "Head of Photography", "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"},
                {"name": "Zoe Bennett", "position": "Film & Editing Lead", "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Golden Hour Photo Walk: Heritage District",
                    "description": "Guided street photo walk followed by an editing and review critique session at the studio.",
                    "event_date": now + datetime.timedelta(days=10),
                    "location": "Old Town Gate Meeting Point",
                    "image_url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/photowalk-reg"
                }
            ]
        },
        {
            "name": "Pulse Music & Dance Society",
            "category": "Cultural",
            "description": "The heartbeat of campus celebrations, band showcases, hip-hop & classical dance performances, acoustic jam sessions, and annual cultural fest concerts.",
            "eligibility": "Musicians, vocalists, dancers of all genres (classical, contemporary, hip-hop), and sound engineers.",
            "outcomes": "Stage performance confidence, jamming with high-caliber musicians, and headlining inter-collegiate festivals.",
            "logo_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-pulse-application",
            "instagram_url": "https://instagram.com/college_pulse",
            "linkedin_url": "https://linkedin.com/company/college-pulse",
            "website_url": "https://pulse.college.edu",
            "board_members": [
                {"name": "Neil D'Souza", "position": "Music Secretary", "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"},
                {"name": "Aanya Kapoor", "position": "Dance Captain", "photo_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Acoustic Sunset Jam Session",
                    "description": "Unplugged evening on the library lawn featuring original student compositions and open mic.",
                    "event_date": now + datetime.timedelta(days=12),
                    "location": "North Library Lawn",
                    "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/acoustic-reg"
                }
            ]
        },
        {
            "name": "College Sports & Athletics Union",
            "category": "Sports",
            "description": "Promoting fitness, sportsmanship, and inter-university excellence in football, basketball, cricket, badminton, volleyball, and track & field.",
            "eligibility": "Athletes of all levels seeking recreational fitness or competitive collegiate representation.",
            "outcomes": "Peak physical conditioning, teamwork, tournament trophies, and university sports scholarship eligibility.",
            "logo_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-sports-application",
            "instagram_url": "https://instagram.com/college_sports",
            "linkedin_url": "https://linkedin.com/company/college-sports",
            "website_url": "https://sports.college.edu",
            "board_members": [
                {"name": "Vikram Rathore", "position": "Sports President", "photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"},
                {"name": "Jessica Taylor", "position": "Athletics Coordinator", "photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Inter-Branch Football League Finals",
                    "description": "The culminating battle between CS Strikers and Mechanical Bulls for the 2026 Chancellor's Trophy.",
                    "event_date": now + datetime.timedelta(days=16),
                    "location": "Main Sports Stadium",
                    "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/sports-reg"
                }
            ]
        },
        {
            "name": "Cyber Security & Ethical Hacking Guild",
            "category": "Technical",
            "description": "Sharpen your offensive and defensive security skills. We compete in worldwide Capture The Flag (CTF) challenges, analyze malware, and audit system vulnerabilities.",
            "eligibility": "Familiarity with Linux and basic networking fundamentals. A strong ethical mindset is strictly mandatory.",
            "outcomes": "CTF competition rankings, mastery of Wireshark, BurpSuite, Metasploit, binary exploitation, and cybersecurity certifications.",
            "logo_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80",
            "cover_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
            "google_form_url": "https://forms.google.com/sample-cybersec-application",
            "instagram_url": "https://instagram.com/college_cybersec",
            "linkedin_url": "https://linkedin.com/company/college-cybersec",
            "website_url": "https://cybersec.college.edu",
            "board_members": [
                {"name": "Devin Wright", "position": "CTF Team Captain", "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"},
                {"name": "Ritika Sen", "position": "Security Researcher", "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
            ],
            "events": [
                {
                    "title": "Collegiate CTF 2026: Cyber Defense War",
                    "description": "Real-time jeopardy style hacking challenge covering Web, Cryptography, Reverse Engineering, and Forensics.",
                    "event_date": now + datetime.timedelta(days=25),
                    "location": "Cyber Lab Room 404",
                    "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                    "is_past": False,
                    "registration_url": "https://forms.google.com/ctf-reg"
                }
            ]
        }
    ]

    for cdata in clubs_data:
        board_members_data = cdata.pop("board_members")
        events_data = cdata.pop("events")

        club = Club(**cdata)
        db.add(club)
        db.flush()  # get club.id

        for bm in board_members_data:
            member = BoardMember(club_id=club.id, **bm)
            db.add(member)

        for ev in events_data:
            event = Event(club_id=club.id, **ev)
            db.add(event)

    db.commit()

    # Pre-save 2 clubs for the student user
    c1 = db.query(Club).filter(Club.name == "AI & Machine Learning Club").first()
    c2 = db.query(Club).filter(Club.name == "Full-Stack Web & Mobile Guild").first()
    if c1 and student_user:
        db.add(SavedClub(user_id=student_user.id, club_id=c1.id))
    if c2 and student_user:
        db.add(SavedClub(user_id=student_user.id, club_id=c2.id))
    db.commit()

    print("Database seeding completed successfully!")
