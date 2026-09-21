from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ClubAdmin, Club
from ..schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def build_user_response(user: User, db: Session) -> UserResponse:
    assigned_club_id = None
    assigned_club_name = None
    if user.role == "CLUB_ADMIN":
        assignment = db.query(ClubAdmin).filter(ClubAdmin.user_id == user.id).first()
        if assignment:
            club = db.query(Club).filter(Club.id == assignment.club_id).first()
            if club:
                assigned_club_id = club.id
                assigned_club_name = club.name

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        roll_number=user.roll_number,
        branch=user.branch,
        year=user.year,
        section=user.section,
        interests=user.interests,
        assigned_club_id=assigned_club_id,
        assigned_club_name=assigned_club_name,
        created_at=user.created_at
    )

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Clean role
    assigned_role = user_in.role if user_in.role in ["STUDENT", "CLUB_ADMIN", "SUPER_ADMIN"] else "STUDENT"

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=assigned_role,
        roll_number=user_in.roll_number,
        branch=user_in.branch,
        year=user_in.year,
        section=user_in.section,
        interests=user_in.interests
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return TokenResponse(access_token=access_token, user=build_user_response(new_user, db))

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=access_token, user=build_user_response(user, db))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_response(current_user, db)

@router.put("/me", response_model=UserResponse)
def update_me(update_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "roll_number" in update_data:
        current_user.roll_number = update_data["roll_number"]
    if "branch" in update_data:
        current_user.branch = update_data["branch"]
    if "year" in update_data:
        current_user.year = update_data["year"]
    if "section" in update_data:
        current_user.section = update_data["section"]
    if "interests" in update_data:
        current_user.interests = update_data["interests"]
    if "name" in update_data and update_data["name"]:
        current_user.name = update_data["name"]

    db.commit()
    db.refresh(current_user)
    return build_user_response(current_user, db)
