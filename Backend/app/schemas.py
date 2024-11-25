from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str]
    is_completed: bool = False

class TaskUpdate(TaskBase):
    pass

class TaskCreate(BaseModel):
    title: str
    description: Optional[str]
    is_completed: bool = False
    project_id: int

class Task(TaskCreate):
    id: int  

    class Config:
        orm_mode = True  

class ProjectBase(BaseModel):
    title: str
    description: Optional[str]

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    owner_id: int
    tasks: List[Task] = []
    participants: List["User"] = [] 

    class Config:
        orm_mode = True

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class UserBase(BaseModel):
    id: int
    username: str
    email: str


class UserCreate(BaseModel): 
    username: str
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: str
    is_subscribed: bool 

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str



class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None        

class SubscriptionRequest(BaseModel):
    plan: str

class SubscriptionStatus(BaseModel):
    is_subscribed: bool
    subscription_end_date: Optional[datetime]
    status: str  

class AddUserRequest(BaseModel):
    user_id: int

class Participant(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

class ProjectWithParticipants(BaseModel):
    project_id: int
    title: str
    participants: List[Participant]

    class Config:
        orm_mode = True