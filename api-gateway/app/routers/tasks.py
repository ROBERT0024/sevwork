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
    is_trash: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las tareas del usuario autenticado.
    Protección IDOR: solo retorna tareas donde user_id == current_user.id.
    """
    query = db.query(Task).filter(Task.user_id == current_user.id, Task.is_deleted == is_trash)
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
        description=task_data.description,
        workspace_id=task_data.workspace_id,
        user_id=current_user.id,
        priority=task_data.priority,
        due_date=task_data.due_date,
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
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.is_deleted is not None:
        task.is_deleted = task_data.is_deleted
    if task_data.is_pinned is not None:
        task.is_pinned = task_data.is_pinned

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
