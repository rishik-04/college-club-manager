from typing import List, Dict, Any
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Club, Event, SavedClub
from ..schemas import AdminStats, UserResponse
from ..auth import require_roles

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    total_clubs = db.query(Club).count()
    total_students = db.query(User).filter(User.role == "STUDENT").count()
    total_events = db.query(Event).count()
    now = datetime.datetime.utcnow()
    upcoming_events = db.query(Event).filter(Event.is_past == False, Event.event_date >= now).count()

    # Top saved clubs
    saved_counts = (
        db.query(Club.name, Club.category, func.count(SavedClub.id).label("count"))
        .outerjoin(SavedClub, Club.id == SavedClub.club_id)
        .group_by(Club.id)
        .order_by(func.count(SavedClub.id).desc())
        .limit(5)
        .all()
    )
    top_saved_clubs = [
        {"name": s[0], "category": s[1], "saved_count": s[2]}
        for s in saved_counts
    ]

    # Category distribution
    cat_counts = (
        db.query(Club.category, func.count(Club.id))
        .group_by(Club.category)
        .all()
    )
    category_distribution = [
        {"category": c[0], "count": c[1]}
        for c in cat_counts
    ]

    return AdminStats(
        total_clubs=total_clubs,
        total_students=total_students,
        total_events=total_events,
        upcoming_events=upcoming_events,
        top_saved_clubs=top_saved_clubs,
        category_distribution=category_distribution
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    return db.query(User).order_by(User.id.asc()).all()

@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    new_role = payload.get("role")
    if new_role not in ["STUDENT", "CLUB_ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    target_user.role = new_role
    db.commit()
    db.refresh(target_user)
    return target_user
