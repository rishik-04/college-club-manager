from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import Club, User, ClubMembership
from ..schemas import ClubAnalyticsResponse, DemographicsDistribution, ClubMemberResponse, ClubMembershipCreate, BranchTree, YearTree, SectionCount, ClubDetailResponse
from ..auth import require_roles, get_current_user, hash_password
from .club_routes import check_club_permission, get_club_details

router = APIRouter(prefix="/api/clubs", tags=["Club Memberships & Demographics Analytics"])

@router.get("/my-memberships", response_model=List[ClubDetailResponse])
def get_my_enrolled_clubs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(ClubMembership).filter(ClubMembership.student_id == current_user.id).all()
    results = []
    for m in memberships:
        c_detail = get_club_details(club_id=m.club_id, db=db, current_user=current_user)
        results.append(c_detail)
    return results

@router.post("/{club_id}/join", response_model=ClubMemberResponse, status_code=status.HTTP_201_CREATED)
def join_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    existing = db.query(ClubMembership).filter(
        ClubMembership.student_id == current_user.id,
        ClubMembership.club_id == club_id
    ).first()

    if existing:
        return ClubMemberResponse(
            id=existing.id,
            student_id=current_user.id,
            student_name=current_user.name,
            student_email=current_user.email,
            roll_number=current_user.roll_number,
            branch=current_user.branch,
            year=current_user.year,
            section=current_user.section,
            status=existing.status or "ACTIVE",
            joined_at=existing.joined_at
        )

    try:
        new_mem = ClubMembership(student_id=current_user.id, club_id=club_id, status="ACTIVE")
        db.add(new_mem)
        db.commit()
        db.refresh(new_mem)
    except IntegrityError:
        db.rollback()
        existing = db.query(ClubMembership).filter(
            ClubMembership.student_id == current_user.id,
            ClubMembership.club_id == club_id
        ).first()
        return ClubMemberResponse(
            id=existing.id,
            student_id=current_user.id,
            student_name=current_user.name,
            student_email=current_user.email,
            roll_number=current_user.roll_number,
            branch=current_user.branch,
            year=current_user.year,
            section=current_user.section,
            status=existing.status or "ACTIVE",
            joined_at=existing.joined_at
        )

    return ClubMemberResponse(
        id=new_mem.id,
        student_id=current_user.id,
        student_name=current_user.name,
        student_email=current_user.email,
        roll_number=current_user.roll_number,
        branch=current_user.branch,
        year=current_user.year,
        section=current_user.section,
        status=new_mem.status,
        joined_at=new_mem.joined_at
    )

@router.get("/{club_id}/analytics", response_model=ClubAnalyticsResponse)
def get_club_analytics(
    club_id: int,
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    total_members = db.query(ClubMembership).filter(ClubMembership.club_id == club_id).count()

    # Aggregate Year Distribution
    year_counts = (
        db.query(User.year, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .filter(ClubMembership.club_id == club_id)
        .group_by(User.year)
        .all()
    )
    year_distribution = [
        DemographicsDistribution(name=y[0] if y[0] else "Unspecified", count=y[1])
        for y in year_counts
    ]

    # Aggregate Branch Distribution
    branch_counts = (
        db.query(User.branch, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .filter(ClubMembership.club_id == club_id)
        .group_by(User.branch)
        .all()
    )
    branch_distribution = [
        DemographicsDistribution(name=b[0] if b[0] else "Unspecified", count=b[1])
        for b in branch_counts
    ]

    # Aggregate Section Distribution
    section_counts = (
        db.query(User.section, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .filter(ClubMembership.club_id == club_id)
        .group_by(User.section)
        .all()
    )
    section_distribution = [
        DemographicsDistribution(name=s[0] if s[0] else "Unspecified", count=s[1])
        for s in section_counts
    ]

    # Hierarchical Drilldown: Branch -> Year -> Section
    tree_rows = (
        db.query(User.branch, User.year, User.section, func.count(ClubMembership.id))
        .join(ClubMembership, User.id == ClubMembership.student_id)
        .filter(ClubMembership.club_id == club_id)
        .group_by(User.branch, User.year, User.section)
        .all()
    )

    # Group tree_rows into dict: { branch: { year: { section: count } } }
    tree_map = {}
    for br, yr, sec, cnt in tree_rows:
        b_name = br if br else "Unspecified Branch"
        y_name = yr if yr else "Unspecified Year"
        s_name = sec if sec else "Unspecified Section"

        if b_name not in tree_map:
            tree_map[b_name] = {}
        if y_name not in tree_map[b_name]:
            tree_map[b_name][y_name] = {}
        tree_map[b_name][y_name][s_name] = cnt

    branch_year_section_tree = []
    for b_name, years_dict in tree_map.items():
        year_list = []
        b_total = 0
        for y_name, sections_dict in years_dict.items():
            sec_list = []
            y_total = 0
            for s_name, s_count in sections_dict.items():
                sec_list.append(SectionCount(section=s_name, count=s_count))
                y_total += s_count
            year_list.append(YearTree(year=y_name, count=y_total, sections=sec_list))
            b_total += y_total
        branch_year_section_tree.append(BranchTree(branch=b_name, count=b_total, years=year_list))

    return ClubAnalyticsResponse(
        club_id=club.id,
        club_name=club.name,
        total_members=total_members,
        year_distribution=year_distribution,
        branch_distribution=branch_distribution,
        section_distribution=section_distribution,
        branch_year_section_tree=branch_year_section_tree
    )

@router.get("/{club_id}/members", response_model=List[ClubMemberResponse])
def get_club_members(
    club_id: int,
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    memberships = (
        db.query(ClubMembership)
        .filter(ClubMembership.club_id == club_id)
        .order_by(ClubMembership.joined_at.desc())
        .all()
    )

    results = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.student_id).first()
        if user:
            results.append(
                ClubMemberResponse(
                    id=m.id,
                    student_id=user.id,
                    student_name=user.name,
                    student_email=user.email,
                    roll_number=user.roll_number,
                    branch=user.branch,
                    year=user.year,
                    section=user.section,
                    status=m.status or "ACTIVE",
                    joined_at=m.joined_at
                )
            )
    return results

@router.post("/{club_id}/members", response_model=ClubMemberResponse, status_code=status.HTTP_201_CREATED)
def add_club_member(
    club_id: int,
    payload: ClubMembershipCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    check_club_permission(admin, club_id, db)
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    student = None

    # Option A: student_id provided
    if payload.student_id:
        student = db.query(User).filter(User.id == payload.student_id).first()

    # Option B: email or roll_number provided
    if not student and (payload.email or payload.roll_number):
        filters = []
        if payload.email:
            filters.append(User.email.ilike(payload.email.strip()))
        if payload.roll_number:
            filters.append(User.roll_number == payload.roll_number.strip())
        
        if filters:
            student = db.query(User).filter(or_(*filters)).first()

    # If student exists, update profile fields if provided and currently empty
    if student:
        updated = False
        if payload.roll_number and not student.roll_number:
            student.roll_number = payload.roll_number
            updated = True
        if payload.branch and not student.branch:
            student.branch = payload.branch
            updated = True
        if payload.year and not student.year:
            student.year = payload.year
            updated = True
        if payload.section and not student.section:
            student.section = payload.section
            updated = True
        if updated:
            db.commit()
            db.refresh(student)
    else:
        # Create new student user
        if not payload.name or not payload.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student name and email are required to create a new member."
            )
        
        default_pw_hash = hash_password("student123")
        student = User(
            name=payload.name.strip(),
            email=payload.email.strip().lower(),
            password_hash=default_pw_hash,
            role="STUDENT",
            roll_number=payload.roll_number.strip() if payload.roll_number else None,
            branch=payload.branch.strip() if payload.branch else "CSE",
            year=payload.year.strip() if payload.year else "1st Year",
            section=payload.section.strip() if payload.section else "A"
        )
        db.add(student)
        try:
            db.commit()
            db.refresh(student)
        except IntegrityError:
            db.rollback()
            student = db.query(User).filter(User.email == payload.email.strip().lower()).first()

    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student could not be created or found.")

    # Check for existing membership
    existing = db.query(ClubMembership).filter(
        ClubMembership.student_id == student.id,
        ClubMembership.club_id == club_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already a member of this club."
        )

    try:
        new_mem = ClubMembership(student_id=student.id, club_id=club_id, status="ACTIVE")
        db.add(new_mem)
        db.commit()
        db.refresh(new_mem)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already a member of this club."
        )

    return ClubMemberResponse(
        id=new_mem.id,
        student_id=student.id,
        student_name=student.name,
        student_email=student.email,
        roll_number=student.roll_number,
        branch=student.branch,
        year=student.year,
        section=student.section,
        status=new_mem.status,
        joined_at=new_mem.joined_at
    )

@router.delete("/{club_id}/members/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_club_member(
    club_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    check_club_permission(admin, club_id, db)
    membership = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == student_id
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found.")

    db.delete(membership)
    db.commit()
    return None
