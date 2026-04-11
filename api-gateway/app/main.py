# Punto de entrada — Secure Workspace API Gateway
# Configuración de FastAPI, CORS, y registro de routers

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter

from app.database import engine, Base
from app.routers import auth, workspaces, notes, tasks

# Ahora se usa Alembic para crear/manejar la base de datos, en produccion o pre-produccion
# no se debe hacer Base.metadata.create_all(bind=engine) ya que asume esquemas vacios y no migra.

app = FastAPI(
    title="Secure Workspace API",
    description="API Gateway para la aplicación Secure Workspace — Proyecto DevSecOps",
    version="1.0.0",
)

# Configurar SlowAPI (Rate Limiting)
app.state.limiter = limiter
from slowapi import _rate_limit_exceeded_handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Manejador Global de Excepciones para estandarizar errores (basado en RFC 7807)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "Ha ocurrido un error inesperado al procesar la solicitud.",
            "instance": str(request.url)
        }
    )


# Middleware para Headers de Seguridad proactivos (HSTS, etc.)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    return response

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
app.include_router(tasks.router)


@app.get("/", tags=["Salud"])
def health_check():
    """Endpoint de verificación de salud del servicio."""
    return {"status": "ok", "service": "secure-workspace-api"}
