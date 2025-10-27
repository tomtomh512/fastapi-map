from fastapi import FastAPI, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.models import User
from app.database import SessionLocal, engine
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class UserCreate(BaseModel):
    username: str
    password: str

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    return "complete"

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "id": user.id,
        "username": user.username,
        "access_token": access_token,
        "token_type": "bearer",
    }

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Token is invalid or expired")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")

@app.post("/verify-token")
def verify_user_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    username = payload.get("sub")

    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "message": "Token is valid",
    }

def search_query(query: str, lat: str, long: str, limit: int):
    base_url = "https://api.geoapify.com/v1/geocode/search"
    params = {
        "text": query,
        "bias": f"proximity:{long},{lat}|circle:{long},{lat},5000",
        "format": "json",
        "limit": limit,
        "apiKey": API_KEY,
    }

    response = requests.get(base_url, params=params)
    data = response.json()

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data")

    results = []

    if not data.get("results") or len(data.get("results")) == 0:
        return results

    for feature in data.get("results"):
        name = feature.get("name") or feature.get("address_line1") or "Unknown"
        address = feature.get("formatted")
        lat = feature.get("lat")
        lon = feature.get("lon")
        place_id = feature.get("place_id")
        category = feature.get("category")
        confidence = feature.get("rank", {}).get("confidence", 0)
        distance = feature.get("distance", 0)

        score = confidence - (distance / 1000) / ((distance / 1000) + 1)

        results.append({
            "name": name,
            "address": address,
            "latitude": float(lat) if lat is not None else 0.0,
            "longitude": float(lon) if lon is not None else 0.0,
            "place_id": place_id,
            "category": category,
            "score": float(score)
        })

    # Sort by score: lower is better (high confidence + close distance)
    results.sort(key=lambda x: x["score"], reverse=True)

    return results

@app.get("/searchQuery")
def search(
        query: str = Query(...),
        lat: str = Query(...),
        long: str = Query(...),
):
    search_result = search_query(query, lat, long, 50)
    return {"results": search_result}