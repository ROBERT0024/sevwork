# Router de espacios de trabajo — Secure Workspace
# Endpoints: listar y crear workspaces (protegidos por JWT, IDOR-safe)

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Workspace
from app.schemas import WorkspaceCreate, WorkspaceResponse
from app.deps import get_current_user

router = APIRouter(prefix="/workspaces", tags=["Espacios de Trabajo"])


@router.get("/", response_model=List[WorkspaceResponse])
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista los espacios de trabajo del usuario autenticado.
    Protección IDOR: solo retorna workspaces donde user_id == current_user.id.
    """
    return db.query(Workspace).filter(Workspace.user_id == current_user.id).all()


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    ws_data: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea un nuevo espacio de trabajo para el usuario autenticado."""
    workspace = Workspace(
        name=ws_data.name,
        description=ws_data.description,
        user_id=current_user.id,
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace
