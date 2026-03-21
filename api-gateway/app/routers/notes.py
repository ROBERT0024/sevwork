# Router de notas — Secure Workspace
# Endpoints: listar, crear y eliminar notas (protegidos por JWT, IDOR-safe)
# Al crear una nota se despacha una tarea Celery para contar palabras

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Note, Workspace
from app.schemas import NoteCreate, NoteResponse
from app.deps import get_current_user

router = APIRouter(prefix="/notes", tags=["Notas"])


def _dispatch_word_count(note_id: int):
    """Despacha la tarea de conteo de palabras al worker Celery.
    Se importa dentro de la función para evitar errores si Redis no está disponible."""
    try:
        from celery import Celery
        from app.config import settings
        celery_app = Celery("worker", broker=settings.REDIS_URL)
        celery_app.send_task("tasks.count_words", args=[note_id])
    except Exception:
        # Si el worker no está disponible, se continúa sin error
        pass


@router.get("/", response_model=List[NoteResponse])
def list_notes(
    workspace_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las notas del usuario autenticado.
    Opcionalmente filtra por workspace_id.
    Protección IDOR: solo retorna notas donde user_id == current_user.id.
    """
    query = db.query(Note).filter(Note.user_id == current_user.id)
    if workspace_id:
        query = query.filter(Note.workspace_id == workspace_id)
    return query.order_by(Note.created_at.desc()).all()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una nueva nota.
    - Verifica que el workspace pertenezca al usuario (IDOR protection).
    - Despacha tarea Celery para conteo de palabras.
    """
    # Verificar que el workspace pertenece al usuario
    workspace = db.query(Workspace).filter(
        Workspace.id == note_data.workspace_id,
        Workspace.user_id == current_user.id,
    ).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio de trabajo no encontrado",
        )

    note = Note(
        title=note_data.title,
        content=note_data.content,
        workspace_id=note_data.workspace_id,
        user_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    # Despachar tarea asíncrona de conteo de palabras
    _dispatch_word_count(note.id)

    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una nota del usuario autenticado.
    Protección IDOR: solo permite eliminar notas propias.
    """
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id,
    ).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada",
        )
    db.delete(note)
    db.commit()
