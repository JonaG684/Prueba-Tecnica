from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, subqueryload
from app import models, schemas, database, dependencies
from typing import List

router = APIRouter()

"""
    Unit to create a new project for the authenticated and subscribed user.
"""
@router.post("/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.is_subscribed)
):
    db_project = models.Project(
        title=project.title,
        description=project.description,
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

"""
    Unit to retrieve all projects owned by or shared with the authenticated user.
"""
@router.get("/", response_model=List[schemas.Project])
def get_user_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    projects = (
        db.query(models.Project)
        .filter(
            (models.Project.owner_id == current_user.id) |
            (models.Project.participants.any(id=current_user.id))
        )
        .all()
    )
    return projects

"""
    Unit to retrieve a specific project by ID, verifying user access permissions.
"""
@router.get("/{project_id}", response_model=schemas.Project)
def get_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_project = (
        db.query(models.Project)
        .options(
            subqueryload(models.Project.tasks),
            subqueryload(models.Project.participants)
        )
        .filter(models.Project.id == project_id)
        .first()
    )
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if db_project.owner_id != current_user.id and current_user not in db_project.participants:
        if not current_user.is_subscribed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project"
            )

    return db_project

"""
    Unit to update a specific project's details, restricted to the project owner.
"""
@router.put("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.is_subscribed)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    if project.title:
        db_project.title = project.title
    if project.description:
        db_project.description = project.description

    db.commit()
    db.refresh(db_project)
    return db_project

"""
    Unit to delete a specific project, restricted to the project owner.
"""
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.is_subscribed)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"detail": "Project deleted successfully"}

"""
    Unit to search for users by name or email who are not part of the project.
"""
@router.get("/{project_id}/search_users", response_model=List[schemas.UserBase])
def search_users(
    project_id: int,
    query: str, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este proyecto.")

    users = (
        db.query(models.User)
        .filter(
            (models.User.username.ilike(f"%{query}%")) | 
            (models.User.email.ilike(f"%{query}%")),
            ~models.User.joined_projects.any(id=project_id),
        )
        .all()
    )
    return [{"id": user.id, "username": user.username, "email": user.email} for user in users]

"""
    Unit to add a user to a project as a participant, restricted to the project owner.
"""
@router.post("/{project_id}/add_user", response_model=schemas.ProjectWithParticipants)
def add_user_to_project(
    project_id: int,
    request: schemas.AddUserRequest, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.is_subscribed),
):
    user_id = request.user_id 

    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para modificar este proyecto."
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user in project.participants:
        raise HTTPException(status_code=400, detail="El usuario ya está en este proyecto.")

    project.participants.append(user)
    db.commit()
    db.refresh(project)

    return schemas.ProjectWithParticipants(
        project_id=project.id,
        title=project.title,
        participants=[{"id": u.id, "username": u.username} for u in project.participants],
    )

"""
    Unit to calculate the progress of a project based on completed tasks.
"""
@router.get("/{project_id}/progress")
def get_project_progress(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    total_tasks = len(project.tasks)
    completed_tasks = len([task for task in project.tasks if task.is_completed])

    progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    return {"progress": progress}

"""
    Unit to retrieve all participants of a project.
"""
@router.get("/{project_id}/users", response_model=List[schemas.User])
def get_project_users(
    project_id: int,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    project = (
        db.query(models.Project)
        .options(subqueryload(models.Project.participants))
        .filter(models.Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user not in project.participants and project.owner_id != current_user.id:
        if not current_user.is_subscribed:
            raise HTTPException(
                status_code=403, detail="You do not have access to this project."
            )

    return project.participants



