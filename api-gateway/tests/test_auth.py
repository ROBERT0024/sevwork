# Pruebas unitarias — Secure Workspace
# Tests para los endpoints de autenticación usando TestClient de FastAPI

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Base de datos en memoria para tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    """Sobreescribe la dependencia de BD para usar SQLite en tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Configurar la app para tests
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Crea las tablas antes de cada test y las elimina después."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


class TestAuth:
    """Pruebas para los endpoints de autenticación."""

    def test_register_exitoso(self):
        """Verifica que un usuario se puede registrar correctamente."""
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == "user"
        assert "id" in data

    def test_register_email_duplicado(self):
        """Verifica que no se puede registrar con un email ya existente."""
        client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
        })
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "otrapassword",
        })
        assert response.status_code == 400
        assert "ya está registrado" in response.json()["detail"]

    def test_register_password_corta(self):
        """Verifica que se rechaza una contraseña menor a 8 caracteres."""
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "short",
        })
        assert response.status_code == 422

    def test_login_exitoso(self):
        """Verifica que el login retorna tokens JWT válidos."""
        # Registrar primero
        client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
        })
        # Login
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_credenciales_incorrectas(self):
        """Verifica que el login falla con credenciales incorrectas."""
        client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
        })
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_health_check(self):
        """Verifica que el endpoint de salud funciona."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
