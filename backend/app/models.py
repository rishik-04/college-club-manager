import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="STUDENT", nullable=False)  # STUDENT, CLUB_ADMIN, SUPER_ADMIN
    roll_number = Column(String(50), nullable=True)
    branch = Column(String(100), nullable=True)  # CSE, Data Science, ECE, EEE, Mechanical, Other
    year = Column(String(50), nullable=True)     # 1st Year, 2nd Year, 3rd Year, 4th Year
    section = Column(String(50), nullable=True)  # Section A, Section B, Section C, Section D
    interests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    saved_clubs = relationship("SavedClub", back_populates="user", cascade="all, delete-orphan")
    admin_assignments = relationship("ClubAdmin", back_populates="user", cascade="all, delete-orphan")

class ClubAdmin(Base):
    __tablename__ = "club_admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="admin_assignments")
    club = relationship("Club", back_populates="admin_assignments")

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(80), index=True, nullable=False)
    eligibility = Column(Text, nullable=False)
    outcomes = Column(Text, nullable=False)
    logo_url = Column(String(500), nullable=True)
    cover_url = Column(String(500), nullable=True)
    google_form_url = Column(String(500), nullable=False)
    instagram_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    board_members = relationship("BoardMember", back_populates="club", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="club", cascade="all, delete-orphan")
    saved_by = relationship("SavedClub", back_populates="club", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="club", cascade="all, delete-orphan")
    admin_assignments = relationship("ClubAdmin", back_populates="club", cascade="all, delete-orphan")

class ClubMembership(Base):
    __tablename__ = "club_memberships"
    __table_args__ = (
        UniqueConstraint("student_id", "club_id", name="unique_student_club"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    status = Column(String(50), default="ACTIVE")
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", backref="club_memberships")
    club = relationship("Club", backref="memberships")

class BoardMember(Base):
    __tablename__ = "board_members"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    name = Column(String(120), nullable=False)
    position = Column(String(100), nullable=False)
    photo_url = Column(String(500), nullable=True)
    email = Column(String(150), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    club = relationship("Club", back_populates="board_members")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(DateTime, nullable=False)
    location = Column(String(150), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_past = Column(Boolean, default=False)
    registration_url = Column(String(500), nullable=True)

    club = relationship("Club", back_populates="events")

class SavedClub(Base):
    __tablename__ = "saved_clubs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_clubs")
    club = relationship("Club", back_populates="saved_by")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="General")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    club = relationship("Club", back_populates="announcements")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    __table_args__ = (
        UniqueConstraint("student_id", "event_id", name="unique_student_event_reg"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User")
    event = relationship("Event")
