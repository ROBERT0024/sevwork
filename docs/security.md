# Controles de Seguridad — Secure Workspace

## Autenticación

- **Hash de contraseñas**: bcrypt con salt automático vía `passlib`.
- **Tokens JWT**: Access token (30 min expiración) + Refresh token (7 días).
- **Algoritmo**: HS256 con clave secreta desde variable de entorno.

## Autorización

- **Roles**: `user` (por defecto) y `admin`.
- **Protección IDOR**: Todas las consultas a la base de datos filtran por `user_id` del token actual.
- **Decorador de roles**: Middleware que valida el rol del usuario antes de ejecutar el endpoint.

## Validación de Entradas

- Todos los endpoints usan **esquemas Pydantic** para validar:
  - Tipos de datos
  - Longitud de campos
  - Formato de email
  - Caracteres permitidos

## Gestión de Secretos

- **Nunca** se guardan secretos en el código fuente.
- Se usa archivo `.env` para desarrollo local (incluido en `.gitignore`).
- En CI/CD se usan **GitHub Secrets**.
- Gitleaks escanea el repositorio para detectar secretos filtrados.

## Seguridad de Contenedores

- Imágenes base **slim/alpine** para minimizar superficie de ataque.
- Contenedores ejecutados con **usuario no-root**.
- Escaneo de imágenes con **Trivy** en el pipeline CI/CD.
- Docker Compose con **red interna** aislada.

## Pipeline DevSecOps

| Fase | Herramienta | Qué Detecta |
|------|-------------|-------------|
| Código | Gitleaks | Secretos en el código |
| Código | Bandit | Vulnerabilidades en Python (SAST) |
| Código | Semgrep | Patrones de seguridad inseguros |
| Dependencias | Trivy | Vulnerabilidades en dependencias (SCA) |
| Build | Trivy | Vulnerabilidades en imágenes Docker |
| Test | Pytest | Fallos en pruebas unitarias |
