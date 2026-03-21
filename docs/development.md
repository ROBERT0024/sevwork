# Guía de Desarrollo — Secure Workspace

## Estructura del Proyecto

```
sevwork/
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas (Login, Dashboard)
│   │   ├── services/        # Llamadas a la API
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── api-gateway/             # Backend FastAPI
│   ├── app/
│   │   ├── routers/         # Rutas (auth, workspaces, notes)
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Esquemas Pydantic
│   │   ├── config.py        # Configuración
│   │   ├── database.py      # Conexión a BD
│   │   ├── deps.py          # Dependencias (auth)
│   │   └── main.py          # Punto de entrada
│   ├── tests/               # Pruebas unitarias
│   ├── Dockerfile
│   └── requirements.txt
├── worker/                  # Worker Celery
│   ├── celery_app.py
│   ├── tasks.py
│   ├── Dockerfile
│   └── requirements.txt
├── infraestructura/
│   ├── terraform/           # IaC (futuro)
│   └── ansible/             # Configuración (futuro)
├── monitoring/              # Monitoreo (futuro)
├── .github/workflows/       # Pipeline CI/CD DevSecOps
├── docs/                    # Documentación
├── docker-compose.yml
└── .env.example
```

## Desarrollo Local sin Docker

### Backend

```bash
cd api-gateway
python -m venv venv
venv\Scripts\activate        # Windows
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

## Convenciones

- **Comentarios**: En español para documentación del proyecto.
- **Variables y código**: En inglés (estándar de la industria).
- **Commits**: Formato convencional (`feat:`, `fix:`, `docs:`, `security:`).
- **Ramas**: `main` (producción), `develop` (desarrollo), `feature/*` (funcionalidades).
