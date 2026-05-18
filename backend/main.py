from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from models import Base, User
from dependencies import get_current_user
from routers import auth, projects, incidents
from sqlalchemy.orm import Session

app = FastAPI(
    title="IncidentIQ-AI Backend",
    description="Refactored incident retrieval backend from scratch",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Automatically create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(incidents.router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "IncidentIQ-AI Backend is running!"}

@app.get("/api/me")
def get_me(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return {"user_id": user_id, "name": "Unknown", "email": "Unknown"}
    return {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email
    }
