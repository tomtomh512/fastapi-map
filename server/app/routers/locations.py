from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import List, Location, ListLocation, User
from app.schemas.location import LocationCreate
from app.core.security import get_db, verify_token

router = APIRouter(prefix="/lists", tags=["Locations"])

@router.post("/{list_id}/locations")
def add_location(list_id: int, location_data: LocationCreate, token: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == token).first()
    lst = db.query(List).filter(List.id == list_id, List.user_id == user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    loc = db.query(Location).filter(Location.place_id == location_data.place_id).first()
    if not loc:
        loc = Location(**location_data.dict())
        db.add(loc)
        db.commit()
        db.refresh(loc)

    if db.query(ListLocation).filter(ListLocation.list_id == lst.id, ListLocation.location_id == loc.id).first():
        raise HTTPException(status_code=400, detail="Location already in list")

    db.add(ListLocation(list_id=lst.id, location_id=loc.id))
    db.commit()
    return {"message": f"Location added to list '{lst.name}'"}

@router.delete("/{list_id}/locations/{place_id}")
def remove_location(list_id: int, place_id: str, token: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == token).first()
    lst = db.query(List).filter(List.id == list_id, List.user_id == user.id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    loc = db.query(Location).filter(Location.place_id == place_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    link = db.query(ListLocation).filter(ListLocation.list_id == lst.id, ListLocation.location_id == loc.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Location not in list")

    db.delete(link)
    db.commit()
    return {"message": "Location removed"}

@router.get("/check-location/{place_id}")
def check_location(place_id: str, token: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == token).first()
    user_lists = db.query(List).filter(List.user_id == user.id).all()
    location = db.query(Location).filter(Location.place_id == place_id).first()

    results = []
    for lst in user_lists:
        added = False
        if location:
            added = db.query(ListLocation).filter(
                ListLocation.list_id == lst.id, ListLocation.location_id == location.id
            ).first() is not None
        results.append({"id": lst.id, "name": lst.name, "added": added})
    return results
