# Dockerfile — API Gateway (FastAPI)
# Imagen ligera con usuario no-root para seguridad

FROM python:3.12-slim

# Metadatos
LABEL maintainer="secure-workspace"
LABEL description="API Gateway - Secure Workspace"

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear usuario no-root
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias (capa separada para cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Cambiar a usuario no-root
USER appuser

# Puerto de la aplicación
EXPOSE 8000

# Ejecutar migraciones automáticas y luego iniciar la aplicación
CMD ["sh", "-c", "alembic upgrade head || true ; uvicorn app.main:app --host 0.0.0.0 --port 8000"]
