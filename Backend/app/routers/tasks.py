from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, subqueryload
from app.utils import get_current_user
from app import models, schemas, database, dependencies
from typing import List
from app.dependencies import is_subscribed

router = APIRouter()

@router.post("/", response_model=schemas.Task, dependencies=[Depends(is_subscribed)])

def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db)):

    """
    Creates a new task and associates it with an existing project.

    This endpoint allows a subscribed user to create a task under a specific project.
    It first validates whether the specified project exists and then creates the task.

    Parameters:
        - task (schemas.TaskCreate): Contains the details of the task to be created (title, description, is_completed, and project_id).
        - db (Session): The database session (injected via dependency).

    Dependencies:
        - is_subscribed: Ensures the user has an active subscription.

    Raises:
        - HTTPException (404): If the specified project is not found.

    Returns:
        - The newly created task as a JSON response.
"""

    db_project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_task = models.Task(
        title=task.title,
        description=task.description,
        is_completed=task.is_completed,
        project_id=task.project_id  
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.Task])
def get_tasks_by_project(
    project_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve all tasks for a specific project.
    """
    tasks = (
        db.query(models.Task)
        .options(subqueryload(models.Task.project))
        .filter(models.Task.project_id == project_id)
        .all()
    )
    return tasks

@router.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve a specific task by ID, including its associated project.
    """
    db_task = (
        db.query(models.Task)
        .options(subqueryload(models.Task.project))
        .filter(models.Task.id == task_id)
        .first()
    )
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=schemas.Task, dependencies=[Depends(is_subscribed)])
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(database.get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db_task.title = task.title
    db_task.description = task.description
    db_task.is_completed = task.is_completed

    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}/status", response_model=schemas.Task)
def update_task_status(
    task_id: int,
    is_completed: bool,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update the completion status of a task (completed or pending).
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this task."
        )

    task.is_completed = is_completed
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a specific task by ID.
    """
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(db_task)
    db.commit()
    return