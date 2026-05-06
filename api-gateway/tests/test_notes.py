# Pruebas unitarias — Notes
# Tests para los endpoints de notas

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


def create_user_and_workspace(email="notetest@example.com"):
    """Helper: crea usuario, workspace y devuelve token + workspace_id."""
    client.post("/auth/register", json={
        "email": email,
        "password": "password123",
    })
    resp = client.post("/auth/login", json={
        "email": email,
        "password": "password123",
    })
    token = resp.json()["access_token"]
    ws_resp = client.post(
        "/workspaces/",
        json={"name": "Espacio Notas"},
        headers={"Authorization": f"Bearer {token}"},
    )
    return token, ws_resp.json()["id"]


class TestNotes:
    """Pruebas para los endpoints de notas."""

    def test_crear_nota(self):
        """Verifica que se puede crear una nota correctamente."""
        token, ws_id = create_user_and_workspace()
        response = client.post(
            "/notes/",
            json={
                "title": "Mi Nota",
                "content": "Contenido de prueba",
                "workspace_id": ws_id,
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Mi Nota"
        assert data["content"] == "Contenido de prueba"
        assert data["workspace_id"] == ws_id

    def test_listar_notas(self):
        """Verifica que se listan las notas del usuario."""
        token, ws_id = create_user_and_workspace()
        # Crear dos notas
        for i in range(2):
            client.post(
                "/notes/",
                json={"title": f"Nota {i}", "content": f"Contenido {i}", "workspace_id": ws_id},
                headers={"Authorization": f"Bearer {token}"},
            )
        response = client.get(
            "/notes/",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_crear_nota_sin_auth(self):
        """Verifica que no se puede crear una nota sin autenticación."""
        response = client.post(
            "/notes/",
            json={"title": "Sin Auth", "content": "Test", "workspace_id": 1},
        )
        assert response.status_code == 403

    def test_crear_nota_titulo_vacio(self):
        """Verifica que se rechaza una nota con título vacío."""
        token, ws_id = create_user_and_workspace()
        response = client.post(
            "/notes/",
            json={"title": "", "content": "Sin título", "workspace_id": ws_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422

    def test_crear_nota_workspace_inexistente(self):
        """Verifica que no se puede crear nota en workspace que no existe."""
        token, _ = create_user_and_workspace()
        response = client.post(
            "/notes/",
            json={"title": "Nota", "content": "Test", "workspace_id": 9999},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404

    def test_actualizar_nota(self):
        """Verifica que se puede actualizar una nota."""
        token, ws_id = create_user_and_workspace()
        create_resp = client.post(
            "/notes/",
            json={"title": "Original", "content": "Viejo", "workspace_id": ws_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        note_id = create_resp.json()["id"]
        response = client.put(
            f"/notes/{note_id}",
            json={"title": "Actualizado", "content": "Nuevo contenido"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Actualizado"
        assert response.json()["content"] == "Nuevo contenido"

    def test_eliminar_nota(self):
        """Verifica que se puede eliminar una nota propia."""
        token, ws_id = create_user_and_workspace()
        create_resp = client.post(
            "/notes/",
            json={"title": "Para Eliminar", "content": "Bye", "workspace_id": ws_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        note_id = create_resp.json()["id"]
        response = client.delete(
            f"/notes/{note_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 204

    def test_eliminar_nota_inexistente(self):
        """Verifica respuesta 404 al eliminar nota que no existe."""
        token, _ = create_user_and_workspace()
        response = client.delete(
            "/notes/9999",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404

    def test_filtrar_notas_por_workspace(self):
        """Verifica que se pueden filtrar notas por workspace_id."""
        token, ws_id = create_user_and_workspace()
        # Crear segundo workspace
        ws2_resp = client.post(
            "/workspaces/",
            json={"name": "Espacio 2"},
            headers={"Authorization": f"Bearer {token}"},
        )
        ws2_id = ws2_resp.json()["id"]
        # Crear notas en ambos workspaces
        client.post(
            "/notes/",
            json={"title": "Nota WS1", "content": "a", "workspace_id": ws_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        client.post(
            "/notes/",
            json={"title": "Nota WS2", "content": "b", "workspace_id": ws2_id},
            headers={"Authorization": f"Bearer {token}"},
        )
        # Filtrar solo las del primer workspace
        response = client.get(
            f"/notes/?workspace_id={ws_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Nota WS1"

    def test_idor_notas(self):
        """Verifica protección IDOR: un usuario no puede ver notas de otro."""
        # Usuario 1 crea nota
        token1, ws_id1 = create_user_and_workspace()
        client.post(
            "/notes/",
            json={"title": "Privada", "content": "Secreta", "workspace_id": ws_id1},
            headers={"Authorization": f"Bearer {token1}"},
        )

        # Usuario 2 intenta listar notas
        client.post("/auth/register", json={
            "email": "otro@example.com", "password": "password123",
        })
        resp2 = client.post("/auth/login", json={
            "email": "otro@example.com", "password": "password123",
        })
        token2 = resp2.json()["access_token"]
        response = client.get(
            "/notes/",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_nota_con_etiqueta(self):
        """Verifica que se puede crear una nota con etiqueta."""
        token, ws_id = create_user_and_workspace()
        response = client.post(
            "/notes/",
            json={
                "title": "Nota Etiquetada",
                "content": "Con tag",
                "workspace_id": ws_id,
                "tag": "importante",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        assert response.json()["tag"] == "importante"

    def test_nota_pinned(self):
        """Verifica que se puede fijar una nota."""
        token, ws_id = create_user_and_workspace()
        response = client.post(
            "/notes/",
            json={
                "title": "Nota Fijada",
                "content": "Pinned",
                "workspace_id": ws_id,
                "is_pinned": True,
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        assert response.json()["is_pinned"] is True
