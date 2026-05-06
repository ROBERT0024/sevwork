# Pruebas unitarias — Workspaces
# Tests para los endpoints de espacios de trabajo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.limiter import limiter

# Desactivar Rate Limiting para los tests
limiter.enabled = False

# Base de datos en memoria para tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Crea las tablas antes de cada test y las elimina después."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


def get_auth_token(email="test@example.com"):
    """Helper: registra un usuario y devuelve el token de acceso."""
    client.post("/auth/register", json={
        "email": email,
        "password": "password123",
    })
    response = client.post("/auth/login", json={
        "email": email,
        "password": "password123",
    })
    return response.json()["access_token"]


class TestWorkspaces:
    """Pruebas para los endpoints de espacios de trabajo."""

    def test_crear_workspace(self):
        """Verifica que se puede crear un workspace correctamente."""
        token = get_auth_token()
        response = client.post(
            "/workspaces/",
            json={"name": "Mi Espacio", "description": "Espacio de prueba"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Mi Espacio"
        assert data["description"] == "Espacio de prueba"
        assert "id" in data

    def test_listar_workspaces(self):
        """Verifica que se listan solo los workspaces del usuario."""
        token = get_auth_token()
        # Crear dos workspaces
        client.post(
            "/workspaces/",
            json={"name": "Espacio 1"},
            headers={"Authorization": f"Bearer {token}"},
        )
        client.post(
            "/workspaces/",
            json={"name": "Espacio 2"},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = client.get(
            "/workspaces/",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_crear_workspace_sin_auth(self):
        """Verifica que no se puede crear un workspace sin autenticación."""
        response = client.post(
            "/workspaces/",
            json={"name": "Sin Auth"},
        )
        assert response.status_code == 403

    def test_crear_workspace_nombre_vacio(self):
        """Verifica que se rechaza un workspace con nombre vacío."""
        token = get_auth_token()
        response = client.post(
            "/workspaces/",
            json={"name": "", "description": "Sin nombre"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_actualizar_workspace(self):
        """Verifica que se puede actualizar el nombre de un workspace."""
        token = get_auth_token()
        create_resp = client.post(
            "/workspaces/",
            json={"name": "Original"},
            headers={"Authorization": f"Bearer {token}"},
        )
        ws_id = create_resp.json()["id"]
        response = client.patch(
            f"/workspaces/{ws_id}",
            json={"name": "Actualizado"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Actualizado"

    def test_eliminar_workspace(self):
        """Verifica que se puede eliminar un workspace propio."""
        token = get_auth_token()
        create_resp = client.post(
            "/workspaces/",
            json={"name": "Para Eliminar"},
            headers={"Authorization": f"Bearer {token}"},
        )
        ws_id = create_resp.json()["id"]
        response = client.delete(
            f"/workspaces/{ws_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 204

    def test_idor_workspace(self):
        """Verifica protección IDOR: un usuario no puede ver workspaces de otro."""
        # Usuario 1 crea un workspace
        client.post("/auth/register", json={
            "email": "user1@example.com", "password": "password123",
        })
        resp1 = client.post("/auth/login", json={
            "email": "user1@example.com", "password": "password123",
        })
        token1 = resp1.json()["access_token"]
        client.post(
            "/workspaces/",
            json={"name": "Privado de User1"},
            headers={"Authorization": f"Bearer {token1}"},
        )

        # Usuario 2 lista workspaces (no debería ver el de User1)
        client.post("/auth/register", json={
            "email": "user2@example.com", "password": "password123",
        })
        resp2 = client.post("/auth/login", json={
            "email": "user2@example.com", "password": "password123",
        })
        token2 = resp2.json()["access_token"]
        response = client.get(
            "/workspaces/",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert response.status_code == 200
        assert len(response.json()) == 0
