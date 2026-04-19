# Router de espacios de trabajo — Secure Workspace
# Endpoints: listar y crear workspaces (protegidos por JWT, IDOR-safe)

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Workspace
from app.schemas import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse
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


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: int,
    ws_data: WorkspaceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza un espacio de trabajo existente.
    Protección IDOR: solo permite editar workspaces propios.
    """
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id,
    ).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio de trabajo no encontrado",
        )

    if ws_data.name is not None:
        workspace.name = ws_data.name
    if ws_data.description is not None:
        workspace.description = ws_data.description

    db.commit()
    db.refresh(workspace)
    return workspace


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina un espacio de trabajo del usuario autenticado.
    Protección IDOR: solo permite eliminar workspaces propios.
    """
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id,
    ).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio de trabajo no encontrado",
        )
    db.delete(workspace)
    db.commit()

