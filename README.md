# 🔒 Secure Workspace

**Aplicación tipo Notion simplificada con pipeline DevSecOps completo.**

Proyecto final de especialización en Ciberseguridad con énfasis en DevSecOps.

## 🏗️ Arquitectura

```
Frontend (React+Vite) → API Gateway (FastAPI) → PostgreSQL
                                ↓
                         Worker (Celery) ↔ Redis
```

## 🚀 Inicio Rápido

```bash
# 1. Clonar y configurar variables de entorno
cp .env.example .env
# Editar .env con valores seguros

# 2. Levantar todos los servicios
docker-compose up --build -d

# 3. Acceder
# Frontend:  http://localhost:3000
# API Docs:  http://localhost:8000/docs
```

## 📁 Estructura

```
sevwork/
├── api-gateway/           # Backend FastAPI (auth JWT, CRUD)
├── worker/                # Worker Celery (conteo palabras, limpieza)
├── frontend/              # Frontend React + Vite
├── infraestructura/       # Terraform / Ansible (futuro)
├── monitoring/            # Monitoreo (futuro)
├── .github/workflows/     # Pipeline CI/CD DevSecOps
├── docs/                  # Documentación del proyecto
├── docker-compose.yml     # Orquestación local
└── .env.example           # Variables de entorno de ejemplo
```

## 🔐 Seguridad Implementada

| Control | Implementación |
|---------|---------------|
| Hash de contraseñas | bcrypt vía passlib |
| Autenticación | JWT access + refresh tokens |
| Autorización | Control de roles (user/admin) |
| Protección IDOR | Queries filtradas por user_id |
| Validación de entradas | Esquemas Pydantic estrictos |
| Secretos | Variables de entorno (.env) |
| Contenedores | Usuario no-root, imágenes slim |

## 🔄 Pipeline DevSecOps

| Fase | Herramientas | Acción |
|------|-------------|--------|
| Código | Gitleaks, Bandit, Semgrep | SAST + detección de secretos |
| Dependencias | Trivy | Análisis SCA |
| Build | Docker + Trivy | Escaneo de imágenes |
| Test | Pytest | Pruebas unitarias |
| DAST | OWASP ZAP | Análisis dinámico |
| Release | Docker Hub | Publicación versionada |

## 📖 Documentación

- [Arquitectura](docs/architecture.md)
- [Modelo de Amenazas](docs/threat-model.md)
- [Controles de Seguridad](docs/security.md)
- [Guía de Despliegue](docs/deployment.md)
- [Guía de Desarrollo](docs/development.md)
