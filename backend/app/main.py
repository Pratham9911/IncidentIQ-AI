from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import users, projects

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IncidentIQ-AI Backend",
    description="Backend for structured incident logging and retrieval system",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(projects.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to IncidentIQ-AI Backend. Go to /docs for API documentation."}
