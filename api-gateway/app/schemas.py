# Esquemas Pydantic — Secure Workspace
# Validación de entradas y respuestas para todos los endpoints

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ──── Auth ────

class UserRegister(BaseModel):
    """Esquema para registro de usuario con validación de email y contraseña."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Esquema para login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Respuesta con tokens JWT."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Datos públicos del usuario (sin contraseña)."""
    id: int
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ──── Workspaces ────

class WorkspaceCreate(BaseModel):
    """Esquema para crear un espacio de trabajo."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=1000)


class WorkspaceResponse(BaseModel):
    """Respuesta de un espacio de trabajo."""
    id: int
    name: str
    description: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ──── Notes ────

class NoteCreate(BaseModel):
    """Esquema para crear una nota."""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="", max_length=50000)
    workspace_id: int


class NoteResponse(BaseModel):
    """Respuesta de una nota."""
    id: int
    title: str
    content: str
    word_count: int
    workspace_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
