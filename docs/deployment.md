# Guía de Despliegue y Operación — Secure Workspace

## Requisitos Previos

- Docker y Docker Compose instalados
- Git instalado
- Cuenta en Docker Hub (para la fase Release del pipeline)
- Repositorio en GitHub (para GitHub Actions)

## Opción 1: Despliegue Local con Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/ROBERT0024/sevwork.git
cd sevwork
```

### 2. Crear archivo de variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con valores seguros:

```env
POSTGRES_USER=securews
POSTGRES_PASSWORD=ContraseñaSegura123!
POSTGRES_DB=securews
DATABASE_URL=postgresql://securews:ContraseñaSegura123!@postgres:5432/securews
JWT_SECRET_KEY=clave-secreta-unica-de-minimo-32-caracteres
REDIS_URL=redis://redis:6379/0
```

> ⚠️ **IMPORTANTE**: Genera contraseñas únicas para producción. Nunca uses los valores de ejemplo.

### 3. Construir y levantar los servicios

```bash
docker-compose up --build -d
```

### 4. Verificar que todo funciona

```bash
docker-compose ps
```

| Servicio | URL | Healthcheck |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Nginx responde 200 |
| API Gateway | http://localhost:8000 | `{"status":"ok"}` |
| API Docs (Swagger) | http://localhost:8000/docs | Interfaz interactiva |
| PostgreSQL | localhost:5432 | `pg_isready` |
| Redis | localhost:6379 | `redis-cli ping` |

### 5. Ver logs de un servicio

```bash
# Ver logs de la API
docker-compose logs -f api-gateway

# Ver logs del worker
docker-compose logs -f worker

# Ver logs de todos
docker-compose logs -f
```

### 6. Detener los servicios

```bash
docker-compose down
```

### 7. Detener y eliminar datos

```bash
docker-compose down -v   # ⚠️ Elimina la base de datos
```

## Opción 2: Despliegue Automatizado con Ansible

Para desplegar en un servidor remoto:

### 1. Configurar el inventario

Editar `infraestructura/ansible/inventory.ini` con la IP de tu servidor:

```ini
[servidores_app]
mi-servidor ansible_host=IP_DEL_SERVIDOR ansible_user=deploy
```

### 2. Ejecutar el playbook

```bash
cd infraestructura/ansible
ansible-playbook -i inventory.ini site.yml
```

El playbook automáticamente:
- Instala Docker y dependencias
- Clona el repositorio
- Genera contraseñas seguras para `.env`
- Levanta todos los servicios
- Verifica que la API y el frontend responden

## Versionamiento de Imágenes

Las imágenes se etiquetan con formato semántico al crear releases:

```
ROBERT0024/sevwork:api-v1.0.0
ROBERT0024/sevwork:worker-v1.0.0
ROBERT0024/sevwork:frontend-v1.0.0
```

Para desarrollo se usan tags de rama:

```
ROBERT0024/sevwork:api-main-latest
ROBERT0024/sevwork:worker-main-abc1234
```

## Publicación en Docker Hub

El pipeline de CI/CD publica automáticamente las imágenes cuando se crea un tag de versión:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Verificar en Docker Hub

Después del push, ve a https://hub.docker.com/u/ROBERT0024 para ver las imágenes publicadas.

## Monitoreo y Operación

### Verificar estado de contenedores

```bash
docker-compose ps
docker stats
```

### Reiniciar un servicio específico

```bash
docker-compose restart api-gateway
```

### Actualizar a una nueva versión

```bash
git pull origin main
docker-compose up --build -d
```

### Backup de la base de datos

```bash
# Crear backup
docker exec sw-postgres pg_dump -U securews securews > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20260321.sql | docker exec -i sw-postgres psql -U securews securews
```
