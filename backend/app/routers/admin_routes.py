from typing import List, Dict, Any, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Club, Event, SavedClub, ClubAdmin, ClubMembership
from ..schemas import AdminStats, UserResponse, ClubAdminAssignmentCreate, ClubAdminAssignmentResponse, ClubDetailResponse
from ..auth import require_roles, get_current_user
from .club_routes import get_club_details

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    total_clubs = db.query(Club).filter(Club.is_active == True).count()
    total_students = db.query(User).filter(User.role == "STUDENT").count()
    total_events = db.query(Event).count()
    total_memberships = db.query(ClubMembership).count()
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

    # Memberships by Year
    year_counts = (
        db.query(User.year, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .group_by(User.year)
        .all()
    )
    memberships_by_year = [
        {"year": y[0] if y[0] else "Unspecified", "count": y[1]}
        for y in year_counts
    ]

    # Memberships by Branch
    branch_counts = (
        db.query(User.branch, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .group_by(User.branch)
        .all()
    )
    memberships_by_branch = [
        {"branch": b[0] if b[0] else "Unspecified", "count": b[1]}
        for b in branch_counts
    ]

    # Club-wise Membership
    club_counts = (
        db.query(Club.id, Club.name, Club.category, Club.logo_url, func.count(ClubMembership.id).label("m_count"))
        .outerjoin(ClubMembership, Club.id == ClubMembership.club_id)
        .filter(Club.is_active == True)
        .group_by(Club.id)
        .order_by(func.count(ClubMembership.id).desc())
        .all()
    )
    club_wise_membership = [
        {
            "club_id": c[0],
            "name": c[1],
            "club_name": c[1],
            "category": c[2],
            "logo_url": c[3],
            "members": c[4],
            "total_members": c[4]
        }
        for c in club_counts
    ]

    return AdminStats(
        total_clubs=total_clubs,
        total_students=total_students,
        total_events=total_events,
        total_memberships=total_memberships,
        upcoming_events=upcoming_events,
        top_saved_clubs=top_saved_clubs,
        category_distribution=category_distribution,
        memberships_by_year=memberships_by_year,
        memberships_by_branch=memberships_by_branch,
        club_wise_membership=club_wise_membership
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    users = db.query(User).order_by(User.id.asc()).all()
    results = []
    for u in users:
        assigned_id = None
        assigned_name = None
        if u.role == "CLUB_ADMIN":
            assignment = db.query(ClubAdmin).filter(ClubAdmin.user_id == u.id).first()
            if assignment:
                c = db.query(Club).filter(Club.id == assignment.club_id).first()
                if c:
                    assigned_id = c.id
                    assigned_name = c.name
        
        enrolled_ids = [m.club_id for m in u.club_memberships] if hasattr(u, 'club_memberships') and u.club_memberships else []

        results.append(
            UserResponse(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                roll_number=u.roll_number,
                branch=u.branch,
                year=u.year,
                section=u.section,
                interests=u.interests,
                enrolled_club_ids=enrolled_ids,
                assigned_club_id=assigned_id,
                assigned_club_name=assigned_name,
                created_at=u.created_at
            )
        )
    return results

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

@router.get("/assignments", response_model=List[ClubAdminAssignmentResponse])
def get_club_admin_assignments(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    assignments = db.query(ClubAdmin).all()
    results = []
    for a in assignments:
        u = db.query(User).filter(User.id == a.user_id).first()
        c = db.query(Club).filter(Club.id == a.club_id).first()
        if u and c:
            results.append(
                ClubAdminAssignmentResponse(
                    id=a.id,
                    user_id=u.id,
                    user_name=u.name,
                    user_email=u.email,
                    club_id=c.id,
                    club_name=c.name,
                    created_at=a.created_at
                )
            )
    return results

@router.post("/assignments", response_model=ClubAdminAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_club_admin(
    payload: ClubAdminAssignmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    club = db.query(Club).filter(Club.id == payload.club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    # Remove previous assignment for user if exists
    db.query(ClubAdmin).filter(ClubAdmin.user_id == user.id).delete()

    # Update user role to CLUB_ADMIN if not already SUPER_ADMIN
    if user.role != "SUPER_ADMIN":
        user.role = "CLUB_ADMIN"

    assignment = ClubAdmin(user_id=user.id, club_id=club.id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return ClubAdminAssignmentResponse(
        id=assignment.id,
        user_id=user.id,
        user_name=user.name,
        user_email=user.email,
        club_id=club.id,
        club_name=club.name,
        created_at=assignment.created_at
    )

@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club_admin_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN"]))
):
    assignment = db.query(ClubAdmin).filter(ClubAdmin.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")
    db.delete(assignment)
    db.commit()
    return None

@router.get("/my-club", response_model=Optional[ClubDetailResponse])
def get_my_assigned_club(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLUB_ADMIN", "SUPER_ADMIN"]))
):
    if current_user.role == "SUPER_ADMIN":
        first_club = db.query(Club).first()
        if first_club:
            return get_club_details(club_id=first_club.id, db=db, current_user=current_user)
        return None

    assignment = db.query(ClubAdmin).filter(ClubAdmin.user_id == current_user.id).first()
    if not assignment:
        # Fallback: return first club if no assignment exists yet
        first_club = db.query(Club).first()
        if first_club:
            return get_club_details(club_id=first_club.id, db=db, current_user=current_user)
        return None

    return get_club_details(club_id=assignment.club_id, db=db, current_user=current_user)
