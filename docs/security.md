# Controles de Seguridad — Secure Workspace

## Resumen

Este documento detalla todos los controles de seguridad implementados en Secure Workspace, las herramientas de escaneo integradas y las políticas de gestión de vulnerabilidades.

## Autenticación

- **Hash de contraseñas**: bcrypt con salt automático vía `passlib`.
- **Longitud mínima**: 8 caracteres (validado por Pydantic).
- **Tokens JWT**: Access token (30 min expiración) + Refresh token (7 días).
- **Algoritmo**: HS256 con clave secreta desde variable de entorno.
- **Librería**: PyJWT (migrado desde python-jose por vulnerabilidades CVE-2024-33663).

## Autorización

- **Roles**: `user` (por defecto) y `admin`.
- **Protección IDOR**: Todas las consultas a la base de datos filtran por `user_id` del token actual.
- **Decorador de roles**: Middleware `require_role()` que valida el rol del usuario antes de ejecutar el endpoint.

## Validación de Entradas

Todos los endpoints usan **esquemas Pydantic** para validar:
- Tipos de datos estrictos
- Longitud de campos
- Formato de email (`email-validator`)
- Caracteres permitidos

Esto previene:
- **Inyección SQL**: ORM SQLAlchemy usa consultas parametrizadas.
- **XSS**: React escapa HTML por defecto.
- **Datos malformados**: Pydantic rechaza datos inválidos antes de llegar a la lógica.

## Gestión de Secretos

| Dónde | Mecanismo | Protección |
|-------|-----------|------------|
| Desarrollo local | Archivo `.env` | Incluido en `.gitignore`, nunca llega al repo |
| CI/CD | GitHub Secrets | Cifrados en reposo, accesibles solo en workflows |
| Código fuente | Gitleaks | Escanea cada commit buscando secretos filtrados |
| Variables | `pydantic-settings` | Carga y valida variables de entorno al arrancar |

## Seguridad de Contenedores

| Control | Implementación |
|---------|---------------|
| Imágenes base ligeras | `python:3.12-slim`, `node:20-alpine`, `nginx:alpine` |
| Usuario no-root | `groupadd appuser && useradd appuser` en Dockerfile |
| Red aislada | Red interna Docker `sw-network` |
| Escaneo de imágenes | Trivy en CI/CD (falla con CVEs CRITICAL) |
| Escaneo de IaC | Checkov valida Dockerfiles y docker-compose.yml |
| Healthchecks | PostgreSQL y Redis con verificación de salud |

## Pipeline DevSecOps

### Herramientas Integradas

| Fase | Herramienta | Qué Detecta | Política |
|------|-------------|-------------|----------|
| Código | Gitleaks | Secretos en el código fuente | Bloquea si encuentra secretos |
| Código | Bandit | Vulnerabilidades en Python (SAST) | Reporta nivel LOW y superior |
| Código | Semgrep | Patrones inseguros (OWASP Top 10) | Reporta coincidencias |
| Dependencias | Trivy SCA | CVEs en dependencias | **Falla con CRITICAL/HIGH** |
| IaC | Checkov | Misconfiguraciones en Docker | Falla con checks no aprobados |
| Build | Trivy imagen | CVEs en imagen Docker final | **Falla con CRITICAL** |
| Test | Pytest | Fallos en pruebas unitarias | Falla si hay tests rotos |
| DAST | OWASP ZAP | Vulnerabilidades en API corriendo | Reporta (no bloquea) |

### Política de Bloqueo

```
exit-code: '1'  →  El pipeline FALLA si se detectan vulnerabilidades CRITICAL/HIGH
```

Esto significa que **ningún código con vulnerabilidades críticas conocidas puede llegar a producción**.

## Gestión de Vulnerabilidades

### Proceso de Remediación

1. **Detección**: Trivy/Dependabot detectan CVE en dependencia.
2. **Evaluación**: Se revisa si el CVE aplica al contexto del proyecto.
3. **Corrección**: Se actualiza la dependencia a una versión segura.
4. **Verificación**: El pipeline valida que ya no hay alertas.
5. **Documentación**: Se registra la remediación.

### Vulnerabilidades Remediadas

| Dependencia | CVE | Severidad | Acción Tomada |
|-------------|-----|-----------|---------------|
| python-jose | CVE-2024-33663 | 🔴 Critical | Migrado a PyJWT 2.9.0 |
| python-jose | CVE-2024-33664 | 🟡 Moderate | Migrado a PyJWT 2.9.0 |
| python-multipart | CVE-2024-53981 | 🟠 High | Actualizado a 0.0.22 |
| python-multipart | CVE-2026-24486 | 🟠 High | Actualizado a 0.0.22 |

### Excepciones Documentadas

Actualmente no hay excepciones de seguridad activas. Todas las vulnerabilidades conocidas han sido remediadas.

## Divulgación Responsable

Si encuentras una vulnerabilidad de seguridad en este proyecto:

1. **No** abras un issue público.
2. Envía un correo a: `ROBERTOUNIVERSIDAD1@GMAIL.COM`
3. Incluye: descripción del problema, pasos para reproducir, impacto estimado.
4. Tiempo de respuesta esperado: 48 horas.
