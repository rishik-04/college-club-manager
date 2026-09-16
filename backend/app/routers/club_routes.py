from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Club, BoardMember, Event, SavedClub, User
from ..schemas import ClubListResponse, ClubDetailResponse, ClubCreate, ClubUpdate, BoardMemberCreate, BoardMemberResponse
from ..auth import get_optional_current_user, require_roles

router = APIRouter(prefix="/api/clubs", tags=["Clubs"])

@router.get("", response_model=List[ClubListResponse])
def get_clubs(
    search: Optional[str] = Query(None, description="Search by club name or keywords"),
    category: Optional[str] = Query(None, description="Filter by club category"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Club)

    if category and category.lower() != "all":
        query = query.filter(Club.category.ilike(category))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Club.name.ilike(search_pattern),
                Club.description.ilike(search_pattern),
                Club.category.ilike(search_pattern),
                Club.outcomes.ilike(search_pattern)
            )
        )

    clubs = query.order_by(Club.name.asc()).all()

    # Get user saved clubs set if logged in
    saved_club_ids = set()
    if current_user:
        saved_club_ids = {
            s.club_id for s in db.query(SavedClub.club_id).filter(SavedClub.user_id == current_user.id).all()
        }

    now = datetime.datetime.utcnow()
    results = []
    for c in clubs:
        saved_count = db.query(SavedClub).filter(SavedClub.club_id == c.id).count()
        events_count = db.query(Event).filter(Event.club_id == c.id).count()
        
        # Next upcoming event teaser
        next_ev = db.query(Event).filter(
            Event.club_id == c.id, 
            Event.is_past == False,
            Event.event_date >= now
        ).order_by(Event.event_date.asc()).first()

        results.append(
            ClubListResponse(
                id=c.id,
                name=c.name,
                description=c.description,
                category=c.category,
                logo_url=c.logo_url,
                cover_url=c.cover_url,
                google_form_url=c.google_form_url,
                saved_count=saved_count,
                is_saved=(c.id in saved_club_ids),
                events_count=events_count,
                next_event_title=next_ev.title if next_ev else None,
                next_event_date=next_ev.event_date if next_ev else None
            )
        )

    return results

@router.get("/{club_id}", response_model=ClubDetailResponse)
def get_club_details(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    saved_count = db.query(SavedClub).filter(SavedClub.club_id == club.id).count()
    is_saved = False
    if current_user:
        is_saved = db.query(SavedClub).filter(
            SavedClub.user_id == current_user.id,
            SavedClub.club_id == club.id
        ).first() is not None

    now = datetime.datetime.utcnow()
    # Separate past and upcoming events based on is_past flag or event_date
    events = db.query(Event).filter(Event.club_id == club.id).order_by(Event.event_date.asc()).all()
    past_events = []
    upcoming_events = []
    for ev in events:
        if ev.is_past or ev.event_date < now:
            past_events.append(ev)
        else:
            upcoming_events.append(ev)

    board_members = db.query(BoardMember).filter(BoardMember.club_id == club.id).all()

    return ClubDetailResponse(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        eligibility=club.eligibility,
        outcomes=club.outcomes,
        logo_url=club.logo_url,
        cover_url=club.cover_url,
        google_form_url=club.google_form_url,
        instagram_url=club.instagram_url,
        linkedin_url=club.linkedin_url,
        website_url=club.website_url,
        created_at=club.created_at,
        updated_at=club.updated_at,
        saved_count=saved_count,
        is_saved=is_saved,
        board_members=board_members,
        past_events=past_events,
        upcoming_events=upcoming_events
    )

@router.post("", response_model=ClubListResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_in: ClubCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    existing = db.query(Club).filter(Club.name == club_in.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A club with this name already exists.")

    new_club = Club(**club_in.dict())
    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return ClubListResponse(
        id=new_club.id,
        name=new_club.name,
        description=new_club.description,
        category=new_club.category,
        logo_url=new_club.logo_url,
        cover_url=new_club.cover_url,
        google_form_url=new_club.google_form_url,
        saved_count=0,
        is_saved=False,
        events_count=0
    )

@router.put("/{club_id}", response_model=ClubDetailResponse)
def update_club(
    club_id: int,
    club_in: ClubUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    update_data = club_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(club, key, value)

    club.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(club)

    return get_club_details(club_id=club.id, db=db, current_user=admin)

@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    db.delete(club)
    db.commit()
    return None

# Board member endpoints
@router.post("/{club_id}/board-members", response_model=BoardMemberResponse)
def add_board_member(
    club_id: int,
    member_in: BoardMemberCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    member = BoardMember(club_id=club.id, **member_in.dict())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{club_id}/board-members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board_member(
    club_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    member = db.query(BoardMember).filter(BoardMember.id == member_id, BoardMember.club_id == club_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
    db.delete(member)
    db.commit()
    return None
