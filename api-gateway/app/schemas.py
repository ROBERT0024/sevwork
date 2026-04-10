# Esquemas Pydantic — Secure Workspace
# Validación de entradas y respuestas para todos los endpoints

from datetime import datetime
from typing import Optional, List
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
    tag: str = Field(default="", max_length=50)
    note_type: str = Field(default="note", max_length=20)  # "note" | "task"
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    """Esquema para actualizar una nota."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, max_length=50000)
    tag: Optional[str] = Field(None, max_length=50)
    is_pinned: Optional[bool] = None
    is_deleted: Optional[bool] = None


class NoteResponse(BaseModel):
    """Respuesta de una nota."""
    id: int
    title: str
    content: str
    word_count: int
    workspace_id: int
    user_id: int
    tag: str
    note_type: str
    is_pinned: bool
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ──── Tasks ────

class TaskCreate(BaseModel):
    """Esquema para crear una tarea."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=50000)
    workspace_id: int
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    is_pinned: bool = False


class TaskUpdate(BaseModel):
    """Esquema para actualizar una tarea."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=50000)
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    is_deleted: Optional[bool] = None
    is_pinned: Optional[bool] = None


class TaskResponse(BaseModel):
    """Respuesta de una tarea."""
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    priority: str
    due_date: Optional[datetime]
    is_deleted: bool = False
    is_pinned: bool = False
    workspace_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
