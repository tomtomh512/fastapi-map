from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)

    lists = relationship("List", back_populates="user", cascade="all, delete-orphan")


class List(Base):
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="lists")
    locations = relationship("ListLocation", back_populates="list", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    place_id = Column(String, unique=True, index=True)
    category = Column(String, nullable=False)

    lists = relationship("ListLocation", back_populates="location")


class ListLocation(Base):
    __tablename__ = "list_locations"

    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)

    list = relationship("List", back_populates="locations")
    location = relationship("Location", back_populates="lists")


# Create tables
Base.metadata.create_all(bind=engine)
