from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import timedelta
from app.schemas.user import UserCreate
from app.models import User, List
from app.core.security import (
    get_db, get_password_hash, verify_password, create_access_token, verify_token
)
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(tags=["Auth"])

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    default_lists = [
        List(name="Favorites", user_id=db_user.id, is_default=True),
        List(name="Planned", user_id=db_user.id, is_default=True),
    ]
    db.add_all(default_lists)
    db.commit()

    return {"message": "User registered successfully"}

@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "id": user.id,
        "username": user.username,
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/verify-token")
def verify_user_token(
        token: str = Body(..., embed=True),
        db: Session = Depends(get_db)
):
    username = verify_token(token)
    user = get_user_by_username(db, username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "message": "Token is valid"
    }
