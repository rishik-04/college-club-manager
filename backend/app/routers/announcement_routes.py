from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Announcement, Club, User
from ..schemas import AnnouncementCreate, AnnouncementResponse
from ..auth import require_roles

router = APIRouter(prefix="/api", tags=["Campus Announcements Newsfeed"])

@router.get("/announcements", response_model=List[AnnouncementResponse])
def get_announcements(
    club_id: Optional[int] = Query(None, description="Filter announcements by club"),
    db: Session = Depends(get_db)
):
    query = db.query(Announcement)
    if club_id:
        query = query.filter(Announcement.club_id == club_id)

    # Order pinned first, then newest
    announcements = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()
    results = []
    for a in announcements:
        club = db.query(Club).filter(Club.id == a.club_id).first()
        results.append(
            AnnouncementResponse(
                id=a.id,
                club_id=a.club_id,
                club_name=club.name if club else "Campus News",
                club_logo=club.logo_url if club else None,
                title=a.title,
                content=a.content,
                category=a.category or "General",
                is_pinned=a.is_pinned,
                created_at=a.created_at
            )
        )
    return results

@router.post("/clubs/{club_id}/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    club_id: int,
    ann_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    new_ann = Announcement(
        club_id=club_id,
        title=ann_in.title,
        content=ann_in.content,
        category=ann_in.category or "General",
        is_pinned=ann_in.is_pinned or False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)

    return AnnouncementResponse(
        id=new_ann.id,
        club_id=new_ann.club_id,
        club_name=club.name,
        club_logo=club.logo_url,
        title=new_ann.title,
        content=new_ann.content,
        category=new_ann.category,
        is_pinned=new_ann.is_pinned,
        created_at=new_ann.created_at
    )

@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")
    db.delete(ann)
    db.commit()
    return None
