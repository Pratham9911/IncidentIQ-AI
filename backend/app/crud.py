from sqlalchemy.orm import Session
from app import models, schemas, auth

# ---- User CRUD ----
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ---- Project CRUD ----
def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(**project.model_dump(), owner_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Optionally, add the owner as a member immediately
    owner = db.query(models.User).filter(models.User.id == user_id).first()
    db_project.members.append(owner)
    db.commit()
    
    return db_project

def get_projects(db: Session, skip: int = 0, limit: int = 100, search: str = ""):
    query = db.query(models.Project)
    if search:
        query = query.filter(models.Project.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def add_user_to_project(db: Session, project_id: int, user_email: str):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not project or not user:
        return None
    
    if user not in project.members:
        project.members.append(user)
        db.commit()
        db.refresh(project)
    
    return project
