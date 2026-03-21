# Guía de Despliegue — Secure Workspace

## Requisitos Previos

- Docker y Docker Compose instalados
- Cuenta en Docker Hub (para la fase Release del pipeline)
- Repositorio en GitHub (para GitHub Actions)

## Despliegue Local con Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/secure-workspace.git
cd secure-workspace
```

### 2. Crear archivo de variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores apropiados:

```env
POSTGRES_USER=securews
POSTGRES_PASSWORD=una_contraseña_segura
POSTGRES_DB=securews
DATABASE_URL=postgresql://securews:una_contraseña_segura@postgres:5432/securews
JWT_SECRET_KEY=tu_clave_secreta_jwt
REDIS_URL=redis://redis:6379/0
```

### 3. Construir y levantar los servicios

```bash
docker-compose up --build -d
```

### 4. Verificar que todo funciona

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

## Versionamiento de Imágenes

Las imágenes se etiquetan con formato semántico:

```
tu-usuario/secure-workspace-api:v1.0.0
tu-usuario/secure-workspace-frontend:v1.0.0
tu-usuario/secure-workspace-worker:v1.0.0
```

## Publicación en Docker Hub

El pipeline de CI/CD publica automáticamente las imágenes cuando se crea un tag de versión:

```bash
git tag v1.0.0
git push origin v1.0.0
```
