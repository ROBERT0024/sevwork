# Modelos ORM — Secure Workspace
# Define las tablas de la base de datos con SQLAlchemy

import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """Modelo de usuario con roles y hash de contraseña."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # "user" o "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    """Espacio de trabajo perteneciente a un usuario."""
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    owner = relationship("User", back_populates="workspaces")
    notes = relationship("Note", back_populates="workspace", cascade="all, delete-orphan")


class Note(Base):
    """Nota dentro de un espacio de trabajo."""
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, default="")
    word_count = Column(Integer, default=0)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relaciones
    owner = relationship("User", back_populates="notes")
    workspace = relationship("Workspace", back_populates="notes")
