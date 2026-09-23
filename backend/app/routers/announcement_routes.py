from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Announcement, Club, User, Event
from ..schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from ..auth import require_roles
from .club_routes import check_club_permission

router = APIRouter(prefix="/api", tags=["Campus Announcements Newsfeed"])

def check_ann_permission(admin: User, club_id: Optional[int], db: Session):
    if admin.role == "SUPER_ADMIN":
        return True
    if club_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can manage campus-wide announcements.")
    check_club_permission(admin, club_id, db)

@router.get("/notifications")
def get_student_notifications(db: Session = Depends(get_db)):
    anns = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(10).all()
    now = datetime.datetime.utcnow()
    events = db.query(Event).filter(Event.is_past == False, Event.event_date >= now).order_by(Event.event_date.asc()).limit(5).all()

    notifications = []
    for a in anns:
        club = db.query(Club).filter(Club.id == a.club_id).first() if a.club_id else None
        notifications.append({
            "id": f"ann-{a.id}",
            "type": "announcement",
            "title": a.title,
            "message": a.content,
            "club_name": club.name if club else "Campus News",
            "club_logo": club.logo_url if club else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "is_read": False
        })

    for ev in events:
        club = db.query(Club).filter(Club.id == ev.club_id).first()
        notifications.append({
            "id": f"event-{ev.id}",
            "type": "event",
            "title": f"New Event: {ev.title}",
            "message": ev.description,
            "club_name": club.name if club else "Campus Club",
            "club_logo": club.logo_url if club else None,
            "created_at": ev.event_date.isoformat() if ev.event_date else None,
            "is_read": False
        })

    return notifications

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
        club = db.query(Club).filter(Club.id == a.club_id).first() if a.club_id else None
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

@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_global_or_club_announcement(
    ann_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    check_ann_permission(admin, ann_in.club_id, db)
    
    club = None
    if ann_in.club_id:
        club = db.query(Club).filter(Club.id == ann_in.club_id).first()
        if not club:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    new_ann = Announcement(
        club_id=ann_in.club_id,
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
        club_name=club.name if club else "Campus News",
        club_logo=club.logo_url if club else None,
        title=new_ann.title,
        content=new_ann.content,
        category=new_ann.category,
        is_pinned=new_ann.is_pinned,
        created_at=new_ann.created_at
    )

@router.post("/clubs/{club_id}/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    club_id: int,
    ann_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    check_ann_permission(admin, club_id, db)
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

@router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    ann_in: AnnouncementUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")

    check_ann_permission(admin, ann.club_id, db)
    update_data = ann_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ann, key, value)

    db.commit()
    db.refresh(ann)

    club = db.query(Club).filter(Club.id == ann.club_id).first() if ann.club_id else None
    return AnnouncementResponse(
        id=ann.id,
        club_id=ann.club_id,
        club_name=club.name if club else "Campus News",
        club_logo=club.logo_url if club else None,
        title=ann.title,
        content=ann.content,
        category=ann.category,
        is_pinned=ann.is_pinned,
        created_at=ann.created_at
    )

@router.put("/announcements/{announcement_id}/pin", response_model=AnnouncementResponse)
def toggle_pin_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")

    check_ann_permission(admin, ann.club_id, db)
    ann.is_pinned = not ann.is_pinned

    db.commit()
    db.refresh(ann)

    club = db.query(Club).filter(Club.id == ann.club_id).first() if ann.club_id else None
    return AnnouncementResponse(
        id=ann.id,
        club_id=ann.club_id,
        club_name=club.name if club else "Campus News",
        club_logo=club.logo_url if club else None,
        title=ann.title,
        content=ann.content,
        category=ann.category,
        is_pinned=ann.is_pinned,
        created_at=ann.created_at
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

    check_ann_permission(admin, ann.club_id, db)
    db.delete(ann)
    db.commit()
    return None
