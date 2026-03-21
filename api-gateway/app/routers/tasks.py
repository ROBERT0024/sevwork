# Router de tareas — Secure Workspace
# Endpoints: listar, crear, actualizar (completar/descompletar) y eliminar tareas
# Protegidos por JWT, con IDOR protection

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Task, Workspace
from app.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tareas"])


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    workspace_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las tareas del usuario autenticado.
    Protección IDOR: solo retorna tareas donde user_id == current_user.id.
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if workspace_id:
        query = query.filter(Task.workspace_id == workspace_id)
    return query.order_by(Task.completed.asc(), Task.created_at.desc()).all()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una nueva tarea dentro de un workspace."""
    workspace = db.query(Workspace).filter(
        Workspace.id == task_data.workspace_id,
        Workspace.user_id == current_user.id,
    ).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio de trabajo no encontrado",
        )

    task = Task(
        title=task_data.title,
        workspace_id=task_data.workspace_id,
        user_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza una tarea (marcar completada, cambiar título).
    Protección IDOR: solo permite editar tareas propias.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada",
        )

    if task_data.title is not None:
        task.title = task_data.title
    if task_data.completed is not None:
        task.completed = task_data.completed

    import datetime
    task.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una tarea del usuario autenticado.
    Protección IDOR: solo permite eliminar tareas propias.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada",
        )
    db.delete(task)
    db.commit()
