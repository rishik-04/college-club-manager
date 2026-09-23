import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "STUDENT"
    roll_number: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    section: Optional[str] = None
    interests: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    roll_number: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    section: Optional[str] = None
    interests: Optional[str] = None
    assigned_club_id: Optional[int] = None
    assigned_club_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ClubAdminAssignmentCreate(BaseModel):
    user_id: int
    club_id: int

class ClubAdminAssignmentResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    club_id: int
    club_name: str
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

class BoardMemberUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    linkedin_url: Optional[str] = None

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
    is_registered: Optional[bool] = False

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
    is_active: Optional[bool] = True

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
    is_active: Optional[bool] = None

class ClubListResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    google_form_url: str
    is_active: bool = True
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
    announcements: List[dict] = []

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
    total_memberships: int
    upcoming_events: int
    top_saved_clubs: List[dict]
    category_distribution: List[dict]
    memberships_by_year: List[dict]
    memberships_by_branch: List[dict]
    club_wise_membership: List[dict]

# Announcement Schemas
class AnnouncementCreate(BaseModel):
    club_id: Optional[int] = None
    title: str
    content: str
    category: Optional[str] = "General"
    is_pinned: Optional[bool] = False

class AnnouncementUpdate(BaseModel):
    club_id: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None

class AnnouncementResponse(BaseModel):
    id: int
    club_id: Optional[int] = None
    club_name: Optional[str] = "Campus News"
    club_logo: Optional[str] = None
    title: str
    content: str
    category: str
    is_pinned: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Club Membership & Demographics Schemas
class ClubMembershipCreate(BaseModel):
    student_id: int

class ClubMemberResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    roll_number: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    section: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    joined_at: datetime.datetime

    class Config:
        from_attributes = True

class DemographicsDistribution(BaseModel):
    name: str
    count: int

class SectionCount(BaseModel):
    section: str
    count: int

class YearTree(BaseModel):
    year: str
    count: int
    sections: List[SectionCount]

class BranchTree(BaseModel):
    branch: str
    count: int
    years: List[YearTree]

class ClubAnalyticsResponse(BaseModel):
    club_id: int
    club_name: str
    total_members: int
    year_distribution: List[DemographicsDistribution]
    branch_distribution: List[DemographicsDistribution]
    section_distribution: List[DemographicsDistribution]
    branch_year_section_tree: Optional[List[BranchTree]] = None
