from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud, models
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@router.get("/", response_model=List[schemas.ProjectResponse])
def search_projects(
    search: str = "",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_projects(db, skip=skip, limit=limit, search=search)

@router.post("/{project_id}/members", response_model=schemas.ProjectResponse)
def add_member_to_project(
    project_id: int,
    user_email: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Ensure current_user is the owner or part of the project (simplifying for now)
    project = crud.add_user_to_project(db=db, project_id=project_id, user_email=user_email)
    if not project:
        raise HTTPException(status_code=404, detail="Project or user not found")
    return project
