from sqlalchemy import Column, Integer, String
from app.database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# Create the database tables if they don't exist

User.metadata.create_all(bind=engine)