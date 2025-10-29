from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, lists, locations, search

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(lists.router)
app.include_router(locations.router)
app.include_router(search.router)