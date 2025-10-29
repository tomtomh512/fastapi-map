from fastapi import APIRouter, Depends
from app.schemas.location import SearchParams
from app.utils.geoapify import search_query

router = APIRouter(prefix="/searchQuery", tags=["Search"])

@router.get("")
def search(params: SearchParams = Depends()):
    results = search_query(params.query, params.lat, params.long, 50)
    return {"results": results}
