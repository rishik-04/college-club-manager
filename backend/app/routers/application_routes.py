from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Club, User
from ..schemas import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api", tags=["Applications & Recruitment Pipeline"])

@router.post("/clubs/{club_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_club(
    club_id: int,
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    # Check if student already submitted an active application
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.club_id == club_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already submitted an application to {club.name}. Current status: {existing.status}"
        )

    new_app = Application(
        user_id=current_user.id,
        club_id=club_id,
        name=app_in.name,
        roll_no=app_in.roll_no,
        branch=app_in.branch,
        mobile_no=app_in.mobile_no,
        whatsapp_no=app_in.whatsapp_no,
        college_email=app_in.college_email,
        personal_email=app_in.personal_email,
        why_join=app_in.why_join,
        tshirt_size=app_in.tshirt_size,
        payment_utr=app_in.payment_utr,
        status="Submitted",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return ApplicationResponse(
        id=new_app.id,
        user_id=new_app.user_id,
        club_id=new_app.club_id,
        club_name=club.name,
        name=new_app.name,
        roll_no=new_app.roll_no,
        branch=new_app.branch,
        mobile_no=new_app.mobile_no,
        whatsapp_no=new_app.whatsapp_no,
        college_email=new_app.college_email,
        personal_email=new_app.personal_email,
        why_join=new_app.why_join,
        tshirt_size=new_app.tshirt_size,
        payment_utr=new_app.payment_utr,
        payment_proof_url=new_app.payment_proof_url,
        status=new_app.status,
        admin_notes=new_app.admin_notes,
        created_at=new_app.created_at
    )

@router.get("/users/me/applications", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        club = db.query(Club).filter(Club.id == a.club_id).first()
        results.append(
            ApplicationResponse(
                id=a.id,
                user_id=a.user_id,
                club_id=a.club_id,
                club_name=club.name if club else "Unknown Club",
                name=a.name,
                roll_no=a.roll_no,
                branch=a.branch,
                mobile_no=a.mobile_no,
                whatsapp_no=a.whatsapp_no,
                college_email=a.college_email,
                personal_email=a.personal_email,
                why_join=a.why_join,
                tshirt_size=a.tshirt_size,
                payment_utr=a.payment_utr,
                payment_proof_url=a.payment_proof_url,
                status=a.status,
                admin_notes=a.admin_notes,
                created_at=a.created_at
            )
        )
    return results

@router.get("/clubs/{club_id}/applications", response_model=List[ApplicationResponse])
def get_club_applications(
    club_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    apps = db.query(Application).filter(Application.club_id == club_id).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        results.append(
            ApplicationResponse(
                id=a.id,
                user_id=a.user_id,
                club_id=a.club_id,
                club_name=club.name,
                name=a.name,
                roll_no=a.roll_no,
                branch=a.branch,
                mobile_no=a.mobile_no,
                whatsapp_no=a.whatsapp_no,
                college_email=a.college_email,
                personal_email=a.personal_email,
                why_join=a.why_join,
                tshirt_size=a.tshirt_size,
                payment_utr=a.payment_utr,
                payment_proof_url=a.payment_proof_url,
                status=a.status,
                admin_notes=a.admin_notes,
                created_at=a.created_at
            )
        )
    return results

@router.get("/admin/applications", response_model=List[ApplicationResponse])
def get_all_applications(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    apps = db.query(Application).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        club = db.query(Club).filter(Club.id == a.club_id).first()
        results.append(
            ApplicationResponse(
                id=a.id,
                user_id=a.user_id,
                club_id=a.club_id,
                club_name=club.name if club else "Club",
                name=a.name,
                roll_no=a.roll_no,
                branch=a.branch,
                mobile_no=a.mobile_no,
                whatsapp_no=a.whatsapp_no,
                college_email=a.college_email,
                personal_email=a.personal_email,
                why_join=a.why_join,
                tshirt_size=a.tshirt_size,
                payment_utr=a.payment_utr,
                payment_proof_url=a.payment_proof_url,
                status=a.status,
                admin_notes=a.admin_notes,
                created_at=a.created_at
            )
        )
    return results

@router.put("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    valid_statuses = ["Submitted", "Screening", "Interview Scheduled", "Offered", "Joined", "Rejected"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    app_obj.status = status_in.status
    if status_in.admin_notes is not None:
        app_obj.admin_notes = status_in.admin_notes
    app_obj.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(app_obj)

    club = db.query(Club).filter(Club.id == app_obj.club_id).first()

    return ApplicationResponse(
        id=app_obj.id,
        user_id=app_obj.user_id,
        club_id=app_obj.club_id,
        club_name=club.name if club else "Club",
        name=app_obj.name,
        roll_no=app_obj.roll_no,
        branch=app_obj.branch,
        mobile_no=app_obj.mobile_no,
        whatsapp_no=app_obj.whatsapp_no,
        college_email=app_obj.college_email,
        personal_email=app_obj.personal_email,
        why_join=app_obj.why_join,
        tshirt_size=app_obj.tshirt_size,
        payment_utr=app_obj.payment_utr,
        payment_proof_url=app_obj.payment_proof_url,
        status=app_obj.status,
        admin_notes=app_obj.admin_notes,
        created_at=app_obj.created_at
    )
