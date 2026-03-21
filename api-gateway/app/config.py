# Configuración del API Gateway — Secure Workspace
# Usa pydantic-settings para cargar variables de entorno de forma segura

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración centralizada del API Gateway.
    Todos los secretos se cargan desde variables de entorno."""

    # Base de datos
    DATABASE_URL: str = "postgresql://securews:securews@postgres:5432/securews"

    # JWT
    JWT_SECRET_KEY: str = "cambiar-en-produccion-con-variable-de-entorno"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis / Celery
    REDIS_URL: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
