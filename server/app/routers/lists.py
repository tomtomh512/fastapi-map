from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import List, User
from app.schemas.list import ListCreate
from app.core.security import get_db, verify_token
from fastapi import Request

router = APIRouter(prefix="/lists", tags=["Lists"])

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
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
    return user

@router.get("")
def get_lists(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lists = db.query(List).filter(List.user_id == user.id).all()
    return [{"id": l.id, "name": l.name, "is_default": l.is_default} for l in lists]


@router.post("")
def create_list(list_data: ListCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_list = List(name=list_data.name, user_id=user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return {"id": new_list.id, "name": new_list.name, "message": "List created successfully"}


@router.get("/{list_id}")
def get_list(list_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lst = db.query(List).filter(List.id == list_id, List.user_id == user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    locations = [{
        "id": ll.location.id,
        "name": ll.location.name,
        "address": ll.location.address,
        "latitude": ll.location.latitude,
        "longitude": ll.location.longitude,
        "place_id": ll.location.place_id,
        "category": ll.location.category,
    } for ll in lst.locations]

    return {"id": lst.id, "name": lst.name, "locations": locations, "is_default": lst.is_default}


@router.delete("/{list_id}")
def delete_list(list_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lst = db.query(List).filter(List.id == list_id, List.user_id == user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    if lst.is_default:
        raise HTTPException(status_code=403, detail="Default lists cannot be deleted")

    db.delete(lst)
    db.commit()
    return {"message": f"List '{lst.name}' deleted successfully"}
