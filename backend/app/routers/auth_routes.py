from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

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
        branch=user_in.branch,
        year=user_in.year,
        interests=user_in.interests
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return TokenResponse(access_token=access_token, user=new_user)

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=access_token, user=user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(update_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "branch" in update_data:
        current_user.branch = update_data["branch"]
    if "year" in update_data:
        current_user.year = update_data["year"]
    if "interests" in update_data:
        current_user.interests = update_data["interests"]
    if "name" in update_data and update_data["name"]:
        current_user.name = update_data["name"]

    db.commit()
    db.refresh(current_user)
    return current_user
