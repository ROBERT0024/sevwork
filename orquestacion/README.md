# Orquestación — Secure Workspace

Esta carpeta contiene las configuraciones para desplegar la aplicación en entornos de producción simulados.

## Opciones Disponibles

### 1. Docker Compose — Producción

Configuración optimizada para producción con:
- Límites de recursos (CPU/memoria)
- Puertos internos no expuestos (PostgreSQL, Redis)
- Healthchecks mejorados
- Red aislada con subnet fija
- Réplicas del API Gateway

```bash
docker compose -f orquestacion/docker-compose.prod.yml up -d
```

### 2. Docker Swarm

Orquestación con Docker Swarm incluyendo:
- Red overlay para comunicación entre nodos
- Docker Secrets para gestión segura de credenciales
- Rolling updates con rollback automático
- Réplicas distribuidas entre nodos

```bash
# Inicializar Swarm
docker swarm init

# Crear secretos
echo "ContraseñaSegura123!" | docker secret create db_password -
echo "clave-jwt-super-segura-de-64-caracteres" | docker secret create jwt_secret -

# Desplegar
docker stack deploy -c orquestacion/docker-swarm.yml sw

# Verificar
docker stack services sw
```
