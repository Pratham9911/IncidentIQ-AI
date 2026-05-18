from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List

from database import SessionLocal
from models import Project, ProjectMember, ProjectJoinRequest, User
from dependencies import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

class RespondToJoinRequest(BaseModel):
    action: str = Field(..., description="approved or rejected")

@router.post("")
def create_project(
    request: CreateProjectRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_project = Project(
        name=request.name,
        created_by=user_id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    project_member = ProjectMember(
        project_id=new_project.project_id,
        user_id=user_id,
        role="admin"
    )

    db.add(project_member)
    db.commit()

    return {
        "message": "Project created successfully",
        "project_id": new_project.project_id
    }

@router.get("/my-projects")
def list_my_projects(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(ProjectMember).filter(
        ProjectMember.user_id == user_id
    ).all()

    projects = []
    for membership in memberships:
        project = db.query(Project).filter(
            Project.project_id == membership.project_id
        ).first()

        if project:
            projects.append({
                "project_id": project.project_id,
                "name": project.name,
                "role": membership.role
            })

    return projects

@router.get("/search")
def search_projects(
    query: str = "",
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve projects matching query
    projects_query = db.query(Project)
    if query:
        projects_query = projects_query.filter(Project.name.ilike(f"%{query}%"))
    
    all_projects = projects_query.all()

    result = []
    for project in all_projects:
        # Check user's relationship with project
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.project_id,
            ProjectMember.user_id == user_id
        ).first()

        join_request = db.query(ProjectJoinRequest).filter(
            ProjectJoinRequest.project_id == project.project_id,
            ProjectJoinRequest.user_id == user_id
        ).first()

        status = "none"
        role = None
        if membership:
            status = "member"
            role = membership.role
        elif join_request:
            status = f"requested ({join_request.status})"

        owner = db.query(User).filter(User.user_id == project.created_by).first()

        result.append({
            "project_id": project.project_id,
            "name": project.name,
            "owner_name": owner.name if owner else "Unknown",
            "user_status": status,
            "user_role": role
        })

    return result

@router.post("/{project_id}/join-request")
def request_to_join_project(
    project_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if already a member
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if membership:
        raise HTTPException(status_code=400, detail="You are already a member of this project")

    # Check if a request already exists
    existing_request = db.query(ProjectJoinRequest).filter(
        ProjectJoinRequest.project_id == project_id,
        ProjectJoinRequest.user_id == user_id
    ).first()

    if existing_request:
        if existing_request.status == "pending":
            raise HTTPException(status_code=400, detail="A join request is already pending")
        else:
            # Update rejected/approved request back to pending
            existing_request.status = "pending"
            db.commit()
            return {"message": "Join request re-sent successfully"}

    # Create new join request
    join_request = ProjectJoinRequest(
        project_id=project_id,
        user_id=user_id,
        status="pending"
    )
    db.add(join_request)
    db.commit()

    return {"message": "Join request sent successfully"}

@router.get("/{project_id}/join-requests")
def list_project_join_requests(
    project_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure current user is admin of the project
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
        ProjectMember.role == "admin"
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Only project administrators can view join requests")

    requests = db.query(ProjectJoinRequest).filter(
        ProjectJoinRequest.project_id == project_id,
        ProjectJoinRequest.status == "pending"
    ).all()

    result = []
    for req in requests:
        requesting_user = db.query(User).filter(User.user_id == req.user_id).first()
        result.append({
            "request_id": req.request_id,
            "user_id": req.user_id,
            "user_name": requesting_user.name if requesting_user else "Unknown",
            "user_email": requesting_user.email if requesting_user else "Unknown",
            "created_at": req.created_at
        })

    return result

@router.post("/{project_id}/join-requests/{request_id}/respond")
def respond_to_join_request(
    project_id: int,
    request_id: int,
    response: RespondToJoinRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure current user is admin of the project
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
        ProjectMember.role == "admin"
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Only project administrators can respond to join requests")

    join_req = db.query(ProjectJoinRequest).filter(
        ProjectJoinRequest.request_id == request_id,
        ProjectJoinRequest.project_id == project_id
    ).first()
    if not join_req:
        raise HTTPException(status_code=404, detail="Join request not found")

    if join_req.status != "pending":
        raise HTTPException(status_code=400, detail="Request has already been processed")

    action = response.action.lower()
    if action not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Action must be 'approved' or 'rejected'")

    join_req.status = action

    if action == "approved":
        # Add as a project member
        new_member = ProjectMember(
            project_id=project_id,
            user_id=join_req.user_id,
            role="member"
        )
        db.add(new_member)

    db.commit()
    return {"message": f"Join request {action} successfully"}
