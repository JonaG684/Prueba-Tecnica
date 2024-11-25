from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, database, utils, validators, dependencies


router = APIRouter()

"""
    User Management Endpoints for Creating, Reading, and Updating Users.

    Includes the following functionalities:
    - Create a new user with a unique email and username.
    - Retrieve all users from the database.
    - Retrieve a specific user by their ID.
    - Update a user's role (admin access required).
"""

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Creates a new user in the system.

    Validates that the provided email and username are unique before creating the user.
    Hashes the password before storing it in the database.

    Parameters:
        - user (schemas.UserCreate): The user details (username, email, and password).
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (400): If the email or username already exists.

    Returns:
        - The newly created user as a JSON response.
    """
    validators.validate_unique_email(user.email, db)
    validators.validate_unique_username(user.username, db)

    hashed_password = utils.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.get("/", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(database.get_db)):
    """
    Retrieves a list of all users in the database.

    Parameters:
        - db (Session): The database session (injected via dependency).

    Returns:
        - A list of all users as a JSON response.
    """
    users = db.query(models.User).all()
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    """
    Retrieves a specific user by their ID.

    Parameters:
        - user_id (int): The ID of the user to retrieve.
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (404): If the user is not found.

    Returns:
        - The user details as a JSON response.
    """
    db_user = validators.validate_user_exists(user_id, db)
    return db_user


@router.put("/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int,
    role: str = Query(...),  # Query parameter for the new role
    current_user: models.User = Depends(dependencies.is_admin),  
    db: Session = Depends(database.get_db),
):
    """
    Updates the role of a user. 

    Only administrators can update user roles. Validates that the user exists before performing the update.

    Parameters:
        - user_id (int): The ID of the user whose role needs to be updated.
        - role (str): The new role to assign to the user (provided as a query parameter).
        - current_user (models.User): The currently authenticated user (admin access required).
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (404): If the user is not found.
        - HTTPException (403): If the current user is not an admin.

    Returns:
        - The updated user details as a JSON response.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    db.refresh(user)

    return user

