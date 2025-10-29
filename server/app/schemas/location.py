from pydantic import BaseModel, Field

class LocationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    place_id: str
    category: str | None = None

class SearchParams(BaseModel):
    query: str = Field(...)
    lat: str = Field(...)
    long: str = Field(...)
