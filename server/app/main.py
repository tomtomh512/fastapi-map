from fastapi import FastAPI, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.models import User, List
from app.database import SessionLocal, engine
from pydantic import BaseModel, Field
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

    default_lists = [
        List(name="Favorites", user_id=db_user.id, is_default=True),
        List(name="Planned", user_id=db_user.id, is_default=True),
    ]
    db.add_all(default_lists)
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

class SearchParams(BaseModel):
    query: str = Field(...)
    lat: str = Field(...)
    long: str = Field(...)

@app.get("/searchQuery")
def search(params: SearchParams = Depends()):
    search_result = search_query(params.query, params.lat, params.long, 50)
    return {"results": search_result}

class ListCreate(BaseModel):
    name: str

@app.post("/lists")
def create_list(
        list_data: ListCreate,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    payload = verify_token(token)
    username = payload.get("sub")

    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_list = List(name=list_data.name, user_id=user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)

    return {
        "id": new_list.id,
        "name": new_list.name,
        "user_id": user.id,
        "message": "List created successfully",
    }

@app.get("/lists")
def get_lists(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    payload = verify_token(token)
    username = payload.get("sub")

    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    lists = db.query(List).filter(List.user_id == user.id).all()

    result = []
    for lst in lists:
        result.append({
            "id": lst.id,
            "name": lst.name,
            "is_default": lst.is_default,
        })
    return result

@app.get("/lists/{list_id}")
def get_list(
        list_id: int,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
):
    payload = verify_token(token)
    username = payload.get("sub")

    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    list_to_get = (
        db.query(List)
        .filter(List.id == list_id, List.user_id == user.id)
        .first()
    )

    if not list_to_get:
        raise HTTPException(status_code=404, detail="List not found")

    locations = [
        {
            "id": ll.location.id,
            "name": ll.location.name,
            "address": ll.location.address,
            "latitude": ll.location.latitude,
            "longitude": ll.location.longitude,
            "place_id": ll.location.place_id,
            "category": ll.location.category
        }
        for ll in list_to_get.locations
    ]

    return {
        "id": list_to_get.id,
        "name": list_to_get.name,
        "locations": locations,
        "is_default": list_to_get.is_default,
    }


@app.delete("/lists/{list_id}")
def delete_list(
        list_id: int,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
):
    payload = verify_token(token)
    username = payload.get("sub")

    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    list_to_delete = (
        db.query(List)
        .filter(List.id == list_id, List.user_id == user.id)
        .first()
    )

    if not list_to_delete:
        raise HTTPException(status_code=404, detail="List not found")

    if list_to_delete.is_default:
        raise HTTPException(status_code=403, detail="Default lists cannot be deleted")

    db.delete(list_to_delete)
    db.commit()

    return {"message": f"List '{list_to_delete.name}' deleted successfully"}