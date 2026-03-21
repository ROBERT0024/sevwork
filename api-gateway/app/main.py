# Punto de entrada — Secure Workspace API Gateway
# Configuración de FastAPI, CORS, y registro de routers

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, workspaces, notes

# Crear todas las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Workspace API",
    description="API Gateway para la aplicación Secure Workspace — Proyecto DevSecOps",
    version="1.0.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(notes.router)


@app.get("/", tags=["Salud"])
def health_check():
    """Endpoint de verificación de salud del servicio."""
    return {"status": "ok", "service": "secure-workspace-api"}
