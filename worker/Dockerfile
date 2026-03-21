# Dockerfile — Worker Celery
# Imagen ligera con usuario no-root para seguridad

FROM python:3.12-slim

# Metadatos
LABEL maintainer="secure-workspace"
LABEL description="Celery Worker - Secure Workspace"

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear usuario no-root
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Cambiar a usuario no-root
USER appuser

# Comando de inicio del worker
CMD ["celery", "-A", "celery_app", "worker", "--loglevel=info"]
