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

## Opción 3: Despliegue con Terraform (AWS)

Para desplegar en Amazon Web Services:

### 1. Configurar credenciales AWS

```bash
aws configure
```

### 2. Inicializar y aplicar Terraform

```bash
cd infraestructura/terraform
terraform init
terraform plan -var="db_password=ContraseñaSegura123!" -var="jwt_secret_key=clave-jwt-segura-64-chars"
terraform apply
```

### 3. Verificar el despliegue

```bash
terraform output app_url
terraform output ssh_command
```

## Opción 4: Orquestación con Docker Swarm

Para producción con múltiples nodos:

```bash
# Inicializar Swarm
docker swarm init

# Crear secretos
echo "ContraseñaDB" | docker secret create db_password -
echo "ClaveJWT64chars" | docker secret create jwt_secret -

# Desplegar el stack
docker stack deploy -c orquestacion/docker-swarm.yml sw

# Verificar servicios
docker stack services sw
```

## Resolución de Problemas (Troubleshooting)

### Error: "Cannot connect to Docker daemon"

**Causa**: Docker no está iniciado.

```bash
# Windows: Abrir Docker Desktop
# Linux:
sudo systemctl start docker
```

### Error: "port is already allocated" (Puerto ya en uso)

**Causa**: Otro servicio está usando el puerto 3000, 8000 o 5432.

```bash
# Ver qué proceso usa el puerto (ejemplo: 8000)
# Windows:
netstat -ano | findstr :8000
# Linux:
sudo lsof -i :8000

# Solución: Detener el proceso o cambiar el puerto en docker-compose.yml
```

### Error: "database connection refused"

**Causa**: PostgreSQL aún no está listo cuando la API intenta conectarse.

```bash
# Verificar que PostgreSQL está corriendo y saludable
docker-compose ps
docker-compose logs postgres

# Reiniciar solo la API (PostgreSQL ya debería estar listo)
docker-compose restart api-gateway
```

### Error: "FATAL: password authentication failed"

**Causa**: Las credenciales del `.env` no coinciden con las de PostgreSQL.

```bash
# Solución: Eliminar el volumen y recrear la BD
docker-compose down -v
docker-compose up --build -d
```

> ⚠️ **ADVERTENCIA**: `docker-compose down -v` elimina todos los datos.

### Error: "JWT decode error" o "Token inválido"

**Causa**: La clave JWT cambió entre reinicios.

```bash
# Verificar que JWT_SECRET_KEY en .env no ha cambiado
cat .env | grep JWT_SECRET_KEY

# Solución: Cerrar sesión en el frontend y volver a iniciar sesión
```

### El Worker no procesa tareas

**Causa**: Redis no está accesible o el Worker no se conecta.

```bash
# Verificar que Redis responde
docker exec sw-redis redis-cli ping
# Debería responder: PONG

# Ver los logs del Worker
docker-compose logs -f worker

# Reiniciar Worker
docker-compose restart worker
```

### El Frontend no se conecta a la API

**Causa**: CORS o la API no está disponible.

```bash
# Verificar que la API responde
curl http://localhost:8000/
# Debería responder: {"status":"ok","service":"secure-workspace-api"}

# Ver logs de la API
docker-compose logs -f api-gateway
```

### Docker Compose no encuentra el archivo .env

```bash
# Verificar que existe
ls -la .env

# Si no existe, crear desde el ejemplo
cp .env.example .env     # Linux/Mac
copy .env.example .env   # Windows
```

