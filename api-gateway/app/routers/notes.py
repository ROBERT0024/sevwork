# Router de notas — Secure Workspace
# Endpoints: listar, crear, editar y eliminar notas (protegidos por JWT, IDOR-safe)
# Al crear/editar una nota se despacha una tarea Celery para contar palabras

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Note, Workspace
from app.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.deps import get_current_user

router = APIRouter(prefix="/notes", tags=["Notas"])


def _dispatch_word_count(note_id: int):
    """Despacha la tarea de conteo de palabras al worker Celery."""
    try:
        from celery import Celery
        from app.config import settings
        celery_app = Celery("worker", broker=settings.REDIS_URL)
        celery_app.send_task("tasks.count_words", args=[note_id])
    except Exception:
        pass


@router.get("/", response_model=List[NoteResponse])
def list_notes(
    workspace_id: Optional[int] = None,
    search: Optional[str] = Query(None, max_length=255),
    tag: Optional[str] = Query(None, max_length=50),
    is_trash: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las notas del usuario autenticado.
    Filtra por workspace_id, búsqueda de texto y etiqueta.
    Protección IDOR: solo retorna notas donde user_id == current_user.id.
    """
    query = db.query(Note).filter(Note.user_id == current_user.id, Note.is_deleted == is_trash)
    if workspace_id:
        query = query.filter(Note.workspace_id == workspace_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Note.title.ilike(search_term) | Note.content.ilike(search_term)
        )
    if tag:
        query = query.filter(Note.tag == tag)
    # Notas fijadas primero, luego por fecha descendente
    return query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).all()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una nueva nota con soporte para etiquetas y tipo."""
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
        tag=note_data.tag,
        note_type=note_data.note_type,
        is_pinned=note_data.is_pinned,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    _dispatch_word_count(note.id)
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza una nota existente (título, contenido, etiqueta, pin).
    Protección IDOR: solo permite editar notas propias.
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

    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.tag is not None:
        note.tag = note_data.tag
    if note_data.is_pinned is not None:
        note.is_pinned = note_data.is_pinned
    if note_data.is_deleted is not None:
        note.is_deleted = note_data.is_deleted

    import datetime
    note.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(note)

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
