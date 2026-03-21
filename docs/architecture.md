# Arquitectura — Secure Workspace

## Descripción General

Secure Workspace es una aplicación simplificada tipo Notion construida con **arquitectura de microservicios** y un pipeline **DevSecOps** completo.

## Componentes

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   API Gateway    │────▶│  PostgreSQL   │
│  React+Vite  │     │    FastAPI        │     │  Base Datos   │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                              │
                              │ Despacho de tareas Celery
                              ▼
                     ┌──────────────────┐     ┌──────────────┐
                     │     Worker       │◀───▶│    Redis      │
                     │     Celery       │     │    Broker     │
                     └──────────────────┘     └──────────────┘
```

## Descripción de Servicios

| Servicio | Tecnología | Puerto | Propósito |
|----------|------------|--------|-----------|
| Frontend | React + Vite | 3000 | Interfaz de usuario (login, dashboard, notas) |
| API Gateway | Python FastAPI | 8000 | API REST, autenticación, lógica de negocio |
| Worker | Python Celery | — | Tareas asíncronas (conteo de palabras, limpieza) |
| PostgreSQL | PostgreSQL 15 | 5432 | Almacenamiento persistente de datos |
| Redis | Redis 7 | 6379 | Broker de mensajes para Celery |

## Comunicación

- **Frontend → API Gateway**: HTTP/REST con tokens JWT Bearer.
- **API Gateway → Worker**: Despacho de tareas Celery vía broker Redis.
- **Worker → Base de Datos**: Conexión directa SQLAlchemy para escritura de metadatos.

## Capas de Seguridad

1. **Autenticación**: Tokens JWT de acceso + refresco con hash de contraseñas bcrypt.
2. **Autorización**: Control de acceso basado en roles (user / admin).
3. **Validación de Entradas**: Esquemas Pydantic en cada endpoint.
4. **Protección IDOR**: Todas las consultas limitadas al `current_user.id`.
5. **Gestión de Secretos**: Variables de entorno, nunca hardcodeados.
6. **Seguridad de Contenedores**: Usuarios no-root, imágenes base ligeras.
