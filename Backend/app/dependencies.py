from fastapi import Depends, HTTPException, status
from app.models import User
from app.utils import get_current_user
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.database import DATABASE_URL

def is_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to verify if the current user is an administrator.
    """
    if current_user.role not in ["admin", "superuser"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have the necessary permissions."
        )
    return current_user

def is_subscribed(current_user: User = Depends(get_current_user)):
    """
    Unit to verify if the user is subscribed or paying.
    """
    if not current_user.is_subscribed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a subscribed user to access this resource."
        )
    return current_user

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()