from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


project_users = Table(
    "project_users",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, nullable=False, default="user")
    is_subscribed = Column(Boolean, default=False)
    subscription_end_date = Column(DateTime, nullable=True) 


    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


    joined_projects = relationship(
        "Project", secondary="project_users", back_populates="participants"
    )

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email}, role={self.role})>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="projects")


    owner = relationship("User", back_populates="projects")

  
    participants = relationship(
        "User", secondary="project_users", back_populates="joined_projects"
          )
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title}, owner_id={self.owner_id})>"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    project = relationship("Project", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, is_completed={self.is_completed})>"
