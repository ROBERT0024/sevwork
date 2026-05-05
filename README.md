# 🔒 Secure Workspace

> [!IMPORTANT]
> ### 🚀 [¡HAZ CLIC AQUÍ PARA DESCARGAR E INSTALAR EL PROYECTO!](docs/GUIA_INSTALACION.md)
> **Sigue esta guía paso a paso para hacer funcionar el proyecto en tu máquina.**

---

[![DevSecOps Pipeline](https://github.com/ROBERT0024/sevwork/actions/workflows/devsecops.yml/badge.svg)](https://github.com/ROBERT0024/sevwork/actions/workflows/devsecops.yml)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](docker-compose.yml)

> Aplicación tipo Notion (versión simplificada) con pipeline **DevSecOps** completo.
> Proyecto final de especialización en Ciberseguridad.

## 📌 ¿Qué es Secure Workspace?

Una aplicación web segura donde los usuarios pueden registrarse, autenticarse y gestionar **notas** y **espacios de trabajo** personales. El énfasis del proyecto está en la **arquitectura segura**, la **automatización de seguridad** y las **buenas prácticas DevSecOps**.

## 🏗️ Arquitectura

```
┌──────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   📱 Frontend    │────▶│  🖥️ API Gateway  │────▶│  💾 PostgreSQL │
│   React + Vite   │     │     FastAPI       │     │   Base Datos   │
│   Nginx (prod)   │     └────────┬─────────┘     └───────────────┘
└──────────────────┘              │
                                  │ Tareas Celery
                                  ▼
                         ┌──────────────────┐     ┌───────────────┐
                         │   ⚙️ Worker      │◀───▶│  🔴 Redis     │
                         │     Celery       │     │   Broker       │
                         └──────────────────┘     └───────────────┘
```

| Servicio | Tecnología | Puerto |
|----------|------------|--------|
| Frontend | React + Vite + Nginx | 3000 |
| API Gateway | Python FastAPI | 8000 |
| Worker | Python Celery | — |
| Base de Datos | PostgreSQL 15 | 5432 |
| Broker | Redis 7 | 6379 |

## 🔐 Seguridad Implementada

| Control | Implementación |
|---------|---------------|
| Contraseñas | bcrypt con salt automático |
| Autenticación | JWT access (30 min) + refresh (7 días) |
| Autorización | Roles (user/admin) + protección IDOR |
| Validación | Esquemas Pydantic en cada endpoint |
| Contenedores | Usuario no-root, imágenes slim/alpine |
| Secretos | Variables de entorno + Gitleaks en CI |

## 🛡️ Pipeline DevSecOps

```
Código ──▶ Dependencias ──▶ IaC ──▶ Build ──▶ Test ──▶ DAST ──▶ Release
Gitleaks    Trivy SCA       Checkov  Trivy     Pytest   ZAP     Docker Hub
Bandit      (exit-code:1)           (exit:1)
Semgrep
```

| Fase | Herramienta | Acción |
|------|-------------|--------|
| 🔍 SAST | Gitleaks, Bandit, Semgrep | Detecta secretos y patrones inseguros |
| 📦 SCA | Trivy | Escanea dependencias (**falla con CRITICAL/HIGH**) |
| 🏗️ IaC | Checkov | Valida Dockerfiles y docker-compose |
| 🐳 Imagen | Trivy | Escanea imagen Docker (**falla con CRITICAL**) |
| 🧪 Test | Pytest | Ejecuta pruebas unitarias |
| 🌐 DAST | OWASP ZAP | Escaneo dinámico de la API |
| 🚀 Release | Docker Hub | Publica imágenes con versionado semántico |

## 🚀 Inicio Rápido (Modo Fácil)

> 📖 **¿Primera vez?** Lee la [Guía de Instalación Completa](docs/GUIA_INSTALACION.md) para más detalles.

### Pasos para "Principiantes" (Un Solo Clic)

1. [Descarga el proyecto como ZIP](https://github.com/ROBERT0024/sevwork/archive/refs/heads/main.zip) y descomprímelo (o usa `git clone`).
2. Abre **Docker Desktop**.
3. **Windows:** Haz doble clic en el archivo `setup.bat`.
4. **Mac/Linux:** Ejecuta `sh setup.sh` en la terminal.
5. **Elige el modo:** El script te preguntará si quieres construir desde el código fuente o descargar las imágenes de Docker Hub.

¡Eso es todo! El script configurará todo, levantará el servidor y te abrirá el navegador automáticamente.

---

### Opción A: Modo Local (Construir desde código fuente)

Ideal para desarrollo o si modificaste el código.

```bash
# 1. Clonar
git clone https://github.com/ROBERT0024/sevwork.git
cd sevwork

# 2. Configurar (copiar ejemplo)
# Windows: copy .env.example .env  |  Mac: cp .env.example .env

# 3. Levantar (construye las imágenes desde el código fuente)
docker-compose up --build -d

# 4. Abrir: http://localhost:3000
```

### Opción B: Modo Docker Hub (Imágenes pre-construidas)

Más rápido, no necesita compilar nada. Ideal para probar la aplicación sin modificar código.

```bash
# 1. Clonar
git clone https://github.com/ROBERT0024/sevwork.git
cd sevwork

# 2. Configurar (copiar ejemplo)
# Windows: copy .env.example .env  |  Mac: cp .env.example .env

# 3. Levantar (descarga las imágenes ya construidas desde Docker Hub)
docker compose -f docker-compose.hub.yml up -d

# 4. Abrir: http://localhost:3000
```

> 💡 **¿No quieres clonar todo el repositorio?** Solo necesitas los archivos `docker-compose.hub.yml` y `.env.example`. Descárgalos, renombra `.env.example` a `.env`, y ejecuta el comando del paso 3.

### Apagar los servicios

```bash
# Si usaste Modo Local:
docker-compose down

# Si usaste Modo Docker Hub:
docker compose -f docker-compose.hub.yml down
```

## 📂 Estructura del Proyecto

```
sevwork/
├── api-gateway/          # Backend FastAPI (API REST + Auth)
│   ├── app/              # Código fuente
│   ├── tests/            # Pruebas unitarias
│   ├── Dockerfile        # Imagen Docker (no-root)
│   └── requirements.txt  # Dependencias Python
├── frontend/             # Frontend React + Vite
│   ├── src/              # Código fuente
│   ├── Dockerfile        # Multi-stage (Node → Nginx)
│   └── nginx.conf        # Configuración de Nginx
├── worker/               # Worker Celery
│   ├── tasks.py          # Tareas asíncronas
│   └── Dockerfile        # Imagen Docker (no-root)
├── infraestructura/
│   └── ansible/          # Playbooks de despliegue automatizado
├── docs/                 # Documentación completa
│   ├── architecture.md   # Arquitectura + diagramas UML
│   ├── threat-model.md   # Modelo de amenazas (DFD + STRIDE)
│   ├── security.md       # Controles de seguridad
│   ├── deployment.md     # Guía de despliegue
│   ├── development.md    # Guía de desarrollo
│   └── user-manual.md    # Manual de usuario
├── .github/workflows/
│   └── devsecops.yml     # Pipeline CI/CD completo
├── docker-compose.yml    # Orquestación local (build desde código)
├── docker-compose.hub.yml # Orquestación con imágenes de Docker Hub
├── LICENSE               # Licencia MIT
└── README.md             # Este archivo
```

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [**⭐ Guía de Instalación**](docs/GUIA_INSTALACION.md) | **Paso a paso para hacer funcionar el proyecto en cualquier máquina** |
| [Arquitectura](docs/architecture.md) | Diagramas de componentes, despliegue, secuencia y casos de uso |
| [Modelo de Amenazas](docs/threat-model.md) | DFD nivel 0 y 1, análisis STRIDE detallado |
| [Controles de Seguridad](docs/security.md) | Autenticación, autorización, gestión de vulnerabilidades |
| [Guía de Despliegue](docs/deployment.md) | Docker Compose + Ansible, monitoreo y operación |
| [Guía de Desarrollo](docs/development.md) | Estructura del proyecto y convenciones |
| [Manual de Usuario](docs/user-manual.md) | Cómo usar la aplicación paso a paso |

## 📜 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

## 👤 Autores

**ROBERT0024** — Especialización en Ciberseguridad con énfasis en DevSecOps

**diegohrnz89-ai** — Especialización en Ciberseguridad con énfasis en DevSecOps

**Carlos.Gonzalez** - Especialización en Ciberseguridad con énfasis en DevSecOps

**danielmaodaza** - Especialización en Ciberseguridad con énfasis en DevSecOps
