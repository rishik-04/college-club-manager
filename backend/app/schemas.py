import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "STUDENT"
    branch: Optional[str] = None
    year: Optional[str] = None
    interests: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    branch: Optional[str] = None
    year: Optional[str] = None
    interests: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Board Member Schemas
class BoardMemberBase(BaseModel):
    name: str
    position: str
    photo_url: Optional[str] = None
    email: Optional[str] = None
    linkedin_url: Optional[str] = None

class BoardMemberCreate(BoardMemberBase):
    pass

class BoardMemberResponse(BoardMemberBase):
    id: int
    club_id: int

    class Config:
        from_attributes = True

# Event Schemas
class EventBase(BaseModel):
    title: str
    description: str
    event_date: datetime.datetime
    location: str
    image_url: Optional[str] = None
    is_past: Optional[bool] = False
    registration_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime.datetime] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_past: Optional[bool] = None
    registration_url: Optional[str] = None

class EventResponse(EventBase):
    id: int
    club_id: int
    club_name: Optional[str] = None

    class Config:
        from_attributes = True

# Club Schemas
class ClubBase(BaseModel):
    name: str
    description: str
    category: str
    eligibility: str
    outcomes: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    google_form_url: str
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

class ClubCreate(ClubBase):
    pass

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    eligibility: Optional[str] = None
    outcomes: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    google_form_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

class ClubListResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    google_form_url: str
    saved_count: int = 0
    is_saved: bool = False
    events_count: int = 0
    next_event_title: Optional[str] = None
    next_event_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ClubDetailResponse(ClubBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    saved_count: int = 0
    is_saved: bool = False
    board_members: List[BoardMemberResponse] = []
    past_events: List[EventResponse] = []
    upcoming_events: List[EventResponse] = []

    class Config:
        from_attributes = True

# Saved Club Schemas
class SavedClubResponse(BaseModel):
    id: int
    club_id: int
    created_at: datetime.datetime
    club: ClubListResponse

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    interests: List[str]

class RecommendationItem(BaseModel):
    club: ClubListResponse
    match_score: int
    reasons: List[str]

# AI Q&A Schemas
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    related_clubs: List[dict] = []
    sources: List[str] = []

# Admin Stats Schema
class AdminStats(BaseModel):
    total_clubs: int
    total_students: int
    total_events: int
    upcoming_events: int
    top_saved_clubs: List[dict]
    category_distribution: List[dict]

# Comprehensive Application Schemas
class ApplicationCreate(BaseModel):
    name: str
    roll_no: str
    branch: str
    mobile_no: str
    whatsapp_no: str
    college_email: EmailStr
    personal_email: EmailStr
    why_join: str
    tshirt_size: str  # S, M, L, XL, XXL
    payment_utr: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    club_id: int
    club_name: Optional[str] = None
    name: str
    roll_no: str
    branch: str
    mobile_no: str
    whatsapp_no: str
    college_email: str
    personal_email: str
    why_join: str
    tshirt_size: str
    payment_utr: Optional[str] = None
    payment_proof_url: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Ticket / Event Registration Schemas
class TicketResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    event_title: str
    club_name: str
    event_date: datetime.datetime
    location: str
    ticket_code: str
    status: str
    checked_in_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CheckInRequest(BaseModel):
    ticket_code: str

# Announcement Schemas
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    is_pinned: Optional[bool] = False

class AnnouncementResponse(BaseModel):
    id: int
    club_id: int
    club_name: str
    club_logo: Optional[str] = None
    title: str
    content: str
    category: str
    is_pinned: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
