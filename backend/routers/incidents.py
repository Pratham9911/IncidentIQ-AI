from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

from database import SessionLocal
from models import Incident, ProjectMember, User
from dependencies import get_current_user
from rag.embedder import get_embedding
from rag.retriever import retrieve_similar_incidents
from rag.generator import generate_resolution_recommendation

router = APIRouter(prefix="/api/projects/{project_id}/incidents", tags=["Incidents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Enums matching requirements
class ServiceEnum(str, Enum):
    payment_gateway = "payment gateway"
    auth = "auth"
    core_db = "core db"
    frontend = "frontend"

class EnvironmentEnum(str, Enum):
    production = "Production"
    staging = "staging"
    development = "development"

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class LogIncidentRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    service: ServiceEnum
    environment: EnvironmentEnum
    priority: PriorityEnum

class IncidentResponse(BaseModel):
    incident_id: int
    title: str
    description: str
    service: str
    environment: str
    priority: str
    created_at: str

class SemanticSearchResponse(BaseModel):
    similar_incidents: List[dict]
    ai_recommendation: str

@router.post("", response_model=dict)
def log_incident(
    project_id: int,
    request: LogIncidentRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate project membership
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )

    # 2. Combine title and description to construct semantic content
    semantic_content = f"{request.title} \n {request.description}"

    # 3. Retrieve similar past incidents BEFORE saving the new one (so it doesn't match itself)
    similar_incidents = retrieve_similar_incidents(
        query=semantic_content,
        project_id=project_id,
        db=db,
        limit=3,
        max_distance=0.30  # Enforce similarity >= 70%
    )

    # 4. Generate AI resolution recommendation. Always return a useful answer,
    #    even when there are no historical matches.
    fallback_used = False
    if not similar_incidents:
        ai_rec = generate_resolution_recommendation(
            new_title=request.title,
            new_description=request.description,
            new_service=request.service.value,
            similar_incidents=[]
        )
        fallback_used = True
    else:
        ai_rec = generate_resolution_recommendation(
            new_title=request.title,
            new_description=request.description,
            new_service=request.service.value,
            similar_incidents=similar_incidents
        )

    # 5. Generate embedding for the new incident
    new_embedding = get_embedding(semantic_content, is_query=False)

    # 6. Save the new incident with its embedding
    new_incident = Incident(
        project_id=project_id,
        title=request.title,
        description=request.description,
        service=request.service.value,
        environment=request.environment.value,
        priority=request.priority.value,
        created_by=user_id,
        embedding=new_embedding
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return {
        "message": "Incident logged successfully",
        "logged_incident": {
            "incident_id": new_incident.incident_id,
            "title": new_incident.title,
            "description": new_incident.description,
            "service": new_incident.service,
            "environment": new_incident.environment,
            "priority": new_incident.priority,
            "created_at": new_incident.created_at.isoformat() if new_incident.created_at else None
        },
        "similar_past_incidents": similar_incidents,
        "ai_recommendation": ai_rec,
        "fallback_search_used": fallback_used
    }

@router.get("", response_model=List[dict])
def list_incidents(
    project_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate membership
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )
    
    incidents = db.query(Incident).filter(Incident.project_id == project_id).order_by(Incident.created_at.desc()).all()
    
    output = []
    for inc in incidents:
        output.append({
            "incident_id": inc.incident_id,
            "title": inc.title,
            "description": inc.description,
            "service": inc.service,
            "environment": inc.environment,
            "priority": inc.priority,
            "created_at": inc.created_at.isoformat() if inc.created_at else None
        })
    return output

@router.get("/search")
def search_incidents(
    project_id: int,
    query: str,
    limit: Optional[int] = 5,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate project membership
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )

    # 2. Retrieve similar incidents
    similar_incidents = retrieve_similar_incidents(
        query=query,
        project_id=project_id,
        db=db,
        limit=limit,
        max_distance=0.30  # Enforce similarity >= 70%
    )

    # 3. Generate AI insights based on semantic search query. Always provide an actionable response.
    fallback_used = False
    if not similar_incidents:
        ai_rec = generate_resolution_recommendation(
            new_title=query,
            new_description=f"Query search for: {query}",
            new_service="General Diagnostic",
            similar_incidents=[]
        )
        fallback_used = True
    else:
        ai_rec = generate_resolution_recommendation(
            new_title=query,
            new_description=f"Query search for: {query}",
            new_service="General Diagnostic",
            similar_incidents=similar_incidents
        )

    return {
        "query": query,
        "results": similar_incidents,
        "ai_recommendation": ai_rec,
        "fallback_search_used": fallback_used
    }
