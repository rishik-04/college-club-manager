import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="STUDENT", nullable=False)  # STUDENT, CLUB_ADMIN, SUPER_ADMIN
    branch = Column(String(100), nullable=True)
    year = Column(String(50), nullable=True)
    interests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    saved_clubs = relationship("SavedClub", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")

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
    applications = relationship("Application", back_populates="club", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="club", cascade="all, delete-orphan")

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
    tickets = relationship("Ticket", back_populates="event", cascade="all, delete-orphan")

class SavedClub(Base):
    __tablename__ = "saved_clubs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_clubs")
    club = relationship("Club", back_populates="saved_by")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    domain = Column(String(100), nullable=False)  # e.g. Technical, Design, Public Relations, Operations
    experience_level = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    why_join = Column(Text, nullable=False)
    portfolio_url = Column(String(500), nullable=True)
    status = Column(String(50), default="Submitted", nullable=False)  # Submitted, Screening, Interview Scheduled, Offered, Joined, Rejected
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="applications")
    club = relationship("Club", back_populates="applications")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    ticket_code = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(50), default="REGISTERED", nullable=False)  # REGISTERED, CHECKED_IN, CANCELLED
    checked_in_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tickets")
    event = relationship("Event", back_populates="tickets")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="General")  # Recruitment, Event, Urgent, General
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    club = relationship("Club", back_populates="announcements")
