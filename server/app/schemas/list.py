from pydantic import BaseModel

class ListCreate(BaseModel):
    name: str
