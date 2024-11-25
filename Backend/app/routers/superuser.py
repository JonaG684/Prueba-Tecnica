from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.utils import hash_password
import os
from dotenv import load_dotenv


load_dotenv()


SECRET_TOKEN = os.getenv("SECRET_TOKEN")

router = APIRouter()

@router.post("/create-superuser")
def create_superuser(
    user: schemas.UserCreate,  
    token: str = Header(...),  
    db: Session = Depends(database.get_db)
):
    """
      Creates a unique superuser, using a secret token in the request header.
    """
    if token != SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token. Unauthorized.")

    existing_superuser = db.query(models.User).filter(models.User.role == "superuser").first()
    if existing_superuser:
        raise HTTPException(status_code=400, detail="Superuser already exists.")

    hashed_password = hash_password(user.password)
    superuser = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role="superuser",  
        is_active=True,
        is_subscribed=True 
    )
    db.add(superuser)
    db.commit()
    db.refresh(superuser)

    return superuser

