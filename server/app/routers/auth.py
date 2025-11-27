from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.models import User, List
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    hash_password,
    get_db
)
from app.schemas.user import RegisterCreds, LoginCreds

router = APIRouter(prefix="/auth", tags=["Auth"])

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60,  # 15 min
    )

    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

@router.post("/register")
def register(data: RegisterCreds, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    hashed_pw = hash_password(data.password)
    new_user = User(username=data.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default lists
    default_lists = [
        List(name="Favorites", user_id=new_user.id, is_default=True),
        List(name="Planned", user_id=new_user.id, is_default=True),
    ]
    db.add_all(default_lists)
    db.commit()

    return {
        "message": "User registered",
        "user": {"id": new_user.id, "username": new_user.username},
    }

@router.post("/login")
def login(data: LoginCreds, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.username)})
    refresh_token = create_refresh_token({"sub": str(user.username)})

    set_auth_cookies(response, access_token, refresh_token)

    return {"message": "Logged in", "user": {"id": user.id, "username": user.username}}

@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired")

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user.id, "username": user.username}

@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh = request.cookies.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = verify_token(refresh)
    if not payload:
        raise HTTPException(status_code=401, detail="Refresh expired")

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_access = create_access_token({"sub": username})
    new_refresh = create_refresh_token({"sub": username})

    set_auth_cookies(response, new_access, new_refresh)

    return {"message": "Token refreshed"}

@router.post("/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}
