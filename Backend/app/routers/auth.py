from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, utils, database
from jose import JWTError, jwt

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

"""
Authentication and User Registration Endpoints.

Includes functionality for:
- Registering a new user with unique credentials.
- Logging in to obtain a JWT access token for authenticated operations.
"""

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registers a new user in the system.

    Validates that the email and username are unique before creating the user.
    Hashes the password before storing it in the database.

    Parameters:
        - user (schemas.UserCreate): The user's registration details (username, email, password).
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (400): If the email or username already exists.

    Returns:
        - The newly created user as a JSON response.
    """
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists."
        )

    hashed_password = utils.hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """
    Authenticates a user and generates a JWT access token.

    Validates the provided email and password against the stored user credentials.
    If the credentials are valid, generates a JWT access token for the user.

    Parameters:
        - user_credentials (schemas.UserLogin): The user's login details (email, password).
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (403): If the credentials are invalid.

    Returns:
        - A JWT access token and its type as a JSON response.
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid credentials."
        )

    if not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid credentials."
        )

    access_token = utils.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
