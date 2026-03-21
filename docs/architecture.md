# Arquitectura — Secure Workspace

## Descripción General

Secure Workspace es una aplicación simplificada tipo Notion construida con **arquitectura de microservicios** y un pipeline **DevSecOps** completo. El énfasis del proyecto está en la seguridad, la automatización y las buenas prácticas de desarrollo seguro.

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "Capa de Presentación"
        FE["Frontend<br/>React + Vite"]
    end

    subgraph "Capa de Negocio"
        API["API Gateway<br/>FastAPI"]
        AUTH["Módulo Auth<br/>JWT + bcrypt"]
        WS["Módulo Workspaces"]
        NT["Módulo Notes"]
    end

    subgraph "Capa de Procesamiento"
        WK["Worker<br/>Celery"]
        TASKS["Tareas Asíncronas<br/>word_count, cleanup"]
    end

    subgraph "Capa de Datos"
        PG["PostgreSQL 15<br/>Base de Datos"]
        RD["Redis 7<br/>Message Broker"]
    end

    FE -->|"HTTP/REST + JWT"| API
    API --> AUTH
    API --> WS
    API --> NT
    NT -->|"Despacho tarea"| RD
    RD -->|"Consume tarea"| WK
    WK --> TASKS
    TASKS -->|"Escritura directa"| PG
    API -->|"ORM SQLAlchemy"| PG
    AUTH -->|"Verifica tokens"| API
```

## Diagrama de Despliegue

```mermaid
graph TB
    subgraph "Host / Docker Compose"
        subgraph "Red Interna sw-network"
            C1["📱 sw-frontend<br/>Nginx Alpine<br/>Puerto: 3000"]
            C2["🖥️ sw-api<br/>Python 3.12 Slim<br/>Puerto: 8000"]
            C3["⚙️ sw-worker<br/>Python 3.12 Slim"]
            C4["💾 sw-postgres<br/>PostgreSQL 15 Alpine<br/>Puerto: 5432"]
            C5["🔴 sw-redis<br/>Redis 7 Alpine<br/>Puerto: 6379"]
        end
        V1[("📁 postgres_data<br/>Volumen persistente")]
    end

    USR["👤 Usuario"] -->|"HTTP :3000"| C1
    C1 -->|"Proxy /api"| C2
    C2 -->|"TCP :5432"| C4
    C2 -->|"TCP :6379"| C5
    C3 -->|"TCP :6379"| C5
    C3 -->|"TCP :5432"| C4
    C4 --- V1
```

## Diagrama de Secuencia — Flujo de Autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as API Gateway
    participant DB as PostgreSQL

    U->>F: Ingresa email y contraseña
    F->>A: POST /auth/register
    A->>A: Valida datos (Pydantic)
    A->>A: Hash contraseña (bcrypt)
    A->>DB: INSERT usuario
    DB-->>A: Usuario creado
    A-->>F: 201 {id, email, role}
    F-->>U: Muestra éxito

    U->>F: Ingresa credenciales
    F->>A: POST /auth/login
    A->>DB: SELECT usuario por email
    DB-->>A: Datos del usuario
    A->>A: Verifica contraseña (bcrypt)
    A->>A: Genera JWT (access + refresh)
    A-->>F: 200 {access_token, refresh_token}
    F->>F: Guarda token en localStorage
    F-->>U: Redirige al Dashboard
```

## Diagrama de Secuencia — Creación de Nota

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as API Gateway
    participant R as Redis
    participant W as Worker Celery
    participant DB as PostgreSQL

    U->>F: Escribe título y contenido
    F->>A: POST /notes/ (JWT en header)
    A->>A: Decodifica JWT, obtiene user_id
    A->>DB: INSERT nota (user_id, workspace_id)
    DB-->>A: Nota creada (id)
    A->>R: Despacha tarea count_words(note_id)
    R-->>A: Tarea encolada
    A-->>F: 201 {id, title, content, word_count: 0}
    F-->>U: Muestra nota creada

    Note over W,R: Worker consume tarea
    R->>W: Entrega tarea count_words
    W->>DB: SELECT contenido de nota
    W->>W: Cuenta palabras
    W->>DB: UPDATE word_count
```

## Diagrama de Casos de Uso

```mermaid
graph LR
    subgraph "Sistema Secure Workspace"
        UC1(("Registrarse"))
        UC2(("Iniciar Sesión"))
        UC3(("Crear Workspace"))
        UC4(("Ver Workspaces"))
        UC5(("Crear Nota"))
        UC6(("Ver Notas"))
        UC7(("Eliminar Nota"))
        UC8(("Cerrar Sesión"))
        UC9(("Contar Palabras"))
        UC10(("Limpiar Notas Antiguas"))
    end

    U["👤 Usuario"] --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8

    W["⚙️ Worker"] --> UC9
    W --> UC10

    UC5 -.->|"dispara"| UC9
```

## Descripción de Servicios

| Servicio | Tecnología | Puerto | Propósito |
|----------|------------|--------|-----------|
| Frontend | React + Vite + Nginx | 3000 | Interfaz de usuario (login, dashboard, notas) |
| API Gateway | Python FastAPI | 8000 | API REST, autenticación, lógica de negocio |
| Worker | Python Celery | — | Tareas asíncronas (conteo de palabras, limpieza) |
| PostgreSQL | PostgreSQL 15 Alpine | 5432 | Almacenamiento persistente de datos |
| Redis | Redis 7 Alpine | 6379 | Broker de mensajes para Celery |

## Comunicación entre Servicios

- **Frontend → API Gateway**: HTTP/REST con tokens JWT Bearer.
- **API Gateway → Worker**: Despacho de tareas Celery vía broker Redis.
- **Worker → Base de Datos**: Conexión directa SQLAlchemy para escritura de metadatos.

## Capas de Seguridad

1. **Autenticación**: Tokens JWT de acceso (30 min) + refresco (7 días) con hash bcrypt.
2. **Autorización**: Control de acceso basado en roles (user / admin).
3. **Validación de Entradas**: Esquemas Pydantic en cada endpoint.
4. **Protección IDOR**: Todas las consultas limitadas al `current_user.id`.
5. **Gestión de Secretos**: Variables de entorno, nunca hardcodeados.
6. **Seguridad de Contenedores**: Usuarios no-root, imágenes base ligeras, Trivy.
7. **Escaneo IaC**: Checkov valida Dockerfiles y docker-compose.yml.
