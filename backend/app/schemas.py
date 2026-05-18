from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ---- Token Schemas ----
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ---- User Schemas ----
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# ---- Project Schemas ----
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    members: List[UserResponse] = []

    class Config:
        from_attributes = True

class ProjectSearchResponse(ProjectBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
