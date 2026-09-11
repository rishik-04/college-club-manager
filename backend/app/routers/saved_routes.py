from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SavedClub, Club, User, Event
from ..schemas import SavedClubResponse, ClubListResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/users/me/saved-clubs", tags=["Saved Clubs"])

@router.get("", response_model=List[SavedClubResponse])
def get_saved_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_records = db.query(SavedClub).filter(SavedClub.user_id == current_user.id).order_by(SavedClub.created_at.desc()).all()
    results = []
    for s in saved_records:
        club = db.query(Club).filter(Club.id == s.club_id).first()
        if not club:
            continue
        saved_count = db.query(SavedClub).filter(SavedClub.club_id == club.id).count()
        events_count = db.query(Event).filter(Event.club_id == club.id).count()
        results.append(
            SavedClubResponse(
                id=s.id,
                club_id=s.club_id,
                created_at=s.created_at,
                club=ClubListResponse(
                    id=club.id,
                    name=club.name,
                    description=club.description,
                    category=club.category,
                    logo_url=club.logo_url,
                    cover_url=club.cover_url,
                    google_form_url=club.google_form_url,
                    saved_count=saved_count,
                    is_saved=True,
                    events_count=events_count
                )
            )
        )
    return results

@router.post("/{club_id}", status_code=status.HTTP_201_CREATED)
def save_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    existing = db.query(SavedClub).filter(
        SavedClub.user_id == current_user.id,
        SavedClub.club_id == club_id
    ).first()
    if existing:
        return {"message": "Club already saved", "is_saved": True}

    saved = SavedClub(user_id=current_user.id, club_id=club_id, created_at=datetime.datetime.utcnow())
    db.add(saved)
    db.commit()

    saved_count = db.query(SavedClub).filter(SavedClub.club_id == club_id).count()
    return {"message": "Club saved successfully", "is_saved": True, "saved_count": saved_count}

@router.delete("/{club_id}", status_code=status.HTTP_200_OK)
def unsave_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedClub).filter(
        SavedClub.user_id == current_user.id,
        SavedClub.club_id == club_id
    ).first()
    if not saved:
        return {"message": "Club was not saved", "is_saved": False}

    db.delete(saved)
    db.commit()

    saved_count = db.query(SavedClub).filter(SavedClub.club_id == club_id).count()
    return {"message": "Club removed from saved list", "is_saved": False, "saved_count": saved_count}
