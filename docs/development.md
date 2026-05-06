# Guía de Desarrollo — Secure Workspace

## Estructura del Proyecto

```
sevwork/
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas (Login, Dashboard)
│   │   ├── views/           # Vistas principales
│   │   ├── services/        # Llamadas a la API
│   │   ├── utils/           # Utilidades
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── api-gateway/             # Backend FastAPI
│   ├── app/
│   │   ├── routers/         # Rutas (auth, workspaces, notes, tasks)
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Esquemas Pydantic
│   │   ├── config.py        # Configuración
│   │   ├── database.py      # Conexión a BD
│   │   ├── deps.py          # Dependencias (auth, roles)
│   │   ├── limiter.py       # Rate limiting
│   │   └── main.py          # Punto de entrada
│   ├── tests/               # Pruebas unitarias
│   │   ├── test_auth.py     # Tests de autenticación
│   │   ├── test_workspaces.py # Tests de workspaces
│   │   └── test_notes.py    # Tests de notas
│   ├── alembic/             # Migraciones de BD
│   ├── Dockerfile
│   └── requirements.txt
├── worker/                  # Worker Celery
│   ├── celery_app.py
│   ├── tasks.py
│   ├── Dockerfile
│   └── requirements.txt
├── infraestructura/
│   ├── terraform/           # IaC con Terraform (AWS)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── ansible/             # Playbook de despliegue
│       ├── site.yml
│       └── inventory.ini
├── orquestacion/            # Orquestación de producción
│   ├── docker-compose.prod.yml  # Compose para producción
│   ├── docker-swarm.yml     # Docker Swarm stack
│   └── README.md
├── monitoring/              # Monitoreo (Prometheus/Grafana)
├── .github/workflows/       # Pipeline CI/CD DevSecOps
│   └── devsecops.yml
├── docs/                    # Documentación completa
├── docker-compose.yml       # Desarrollo local
├── docker-compose.hub.yml   # Imágenes pre-construidas
├── .pre-commit-config.yaml  # Hooks de seguridad pre-commit
└── .env.example             # Variables de entorno ejemplo
```

## Desarrollo Local sin Docker

### Backend

```bash
cd api-gateway
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Worker

```bash
cd worker
pip install -r requirements.txt
celery -A celery_app worker --loglevel=info
```

## Ejecutar Pruebas Unitarias

### Ejecutar todos los tests

```bash
cd api-gateway
pytest tests/ -v
```

### Ejecutar con cobertura de código

```bash
cd api-gateway
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Ejecutar un archivo de test específico

```bash
# Solo tests de autenticación
pytest tests/test_auth.py -v

# Solo tests de workspaces
pytest tests/test_workspaces.py -v

# Solo tests de notas
pytest tests/test_notes.py -v
```

### Generar reporte de cobertura en HTML

```bash
cd api-gateway
pytest tests/ --cov=app --cov-report=html
# Abrir htmlcov/index.html en el navegador
```

## Hooks Pre-commit

El proyecto incluye hooks pre-commit para detectar problemas de seguridad antes de cada commit.

### Instalación

```bash
pip install pre-commit
pre-commit install
```

### Uso manual

```bash
# Ejecutar todos los hooks sobre todos los archivos
pre-commit run --all-files
```

### Hooks configurados

| Hook | Herramienta | Propósito |
|------|-------------|-----------|
| `gitleaks` | Gitleaks | Detecta secretos filtrados en el código |
| `bandit` | Bandit | Análisis de seguridad estático para Python |
| `trailing-whitespace` | pre-commit | Elimina espacios en blanco al final de líneas |
| `check-yaml` | pre-commit | Valida archivos YAML |
| `detect-private-key` | pre-commit | Detecta claves privadas accidentales |

## Convenciones

- **Comentarios**: En español para documentación del proyecto.
- **Variables y código**: En inglés (estándar de la industria).
- **Commits**: Formato convencional (`feat:`, `fix:`, `docs:`, `security:`, `test:`).
- **Ramas**: `main` (producción), `develop` (desarrollo), `feature/*` (funcionalidades).

## Contribuir al Proyecto

### Flujo de trabajo (Branching Strategy)

1. Crear una rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mi-funcionalidad
   ```

2. Desarrollar la funcionalidad, asegurando que los tests pasen:
   ```bash
   pytest tests/ -v --cov=app
   ```

3. Hacer commit siguiendo la convención:
   ```bash
   git add .
   git commit -m "feat: agregar funcionalidad X"
   ```

4. Crear un Pull Request hacia `develop`.

5. Después de revisión y aprobación, merge a `develop`.

6. Para releases, merge de `develop` a `main` con tag:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

### Convención de Commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Solo cambios en documentación |
| `test:` | Agregar o modificar tests |
| `security:` | Corrección de vulnerabilidad |
| `refactor:` | Refactorización sin cambio funcional |
| `ci:` | Cambios en pipeline CI/CD |
