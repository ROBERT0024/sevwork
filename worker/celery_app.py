# Aplicación Celery — Secure Workspace Worker
# Configuración del worker conectado a Redis como broker

from celery import Celery
import os

# URL del broker Redis desde variable de entorno
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Crear instancia de Celery
celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks"],
)

# Configuración del worker
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Programar tarea de limpieza cada 24 horas
    beat_schedule={
        "limpieza-diaria": {
            "task": "tasks.cleanup_old_notes",
            "schedule": 86400.0,  # 24 horas en segundos
        },
    },
)
