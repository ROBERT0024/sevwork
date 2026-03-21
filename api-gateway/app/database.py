# Conexión a la base de datos — Secure Workspace
# SQLAlchemy engine, sesión y Base para los modelos

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# Motor de base de datos con pool de conexiones
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Sesión local para cada request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para los modelos ORM
Base = declarative_base()


def get_db():
    """Dependencia de FastAPI: crea y cierra una sesión de BD por request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
