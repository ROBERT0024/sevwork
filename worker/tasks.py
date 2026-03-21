# Tareas asíncronas — Secure Workspace Worker
# Conteo de palabras en notas y limpieza programada

import os
import datetime
from celery_app import celery_app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

# Conexión directa a la base de datos desde el worker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://securews:securews@postgres:5432/securews")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Modelo mínimo de Note para el worker (evita dependencia circular con api-gateway)
class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    content = Column(Text, default="")
    word_count = Column(Integer, default=0)
    workspace_id = Column(Integer)
    user_id = Column(Integer)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)


@celery_app.task(name="tasks.count_words")
def count_words(note_id: int):
    """Cuenta las palabras del contenido de una nota y actualiza el campo word_count.
    Esta tarea se ejecuta de forma asíncrona después de crear una nota."""
    db: Session = SessionLocal()
    try:
        note = db.query(Note).filter(Note.id == note_id).first()
        if note and note.content:
            note.word_count = len(note.content.split())
            note.updated_at = datetime.datetime.utcnow()
            db.commit()
            return {"note_id": note_id, "word_count": note.word_count}
        return {"note_id": note_id, "word_count": 0}
    finally:
        db.close()


@celery_app.task(name="tasks.cleanup_old_notes")
def cleanup_old_notes(days: int = 90):
    """Elimina notas con más de X días de antigüedad.
    Se ejecuta automáticamente vía Celery Beat cada 24 horas."""
    db: Session = SessionLocal()
    try:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        deleted = db.query(Note).filter(Note.created_at < cutoff).delete()
        db.commit()
        return {"deleted_notes": deleted}
    finally:
        db.close()
