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

## Interpretación de Reportes de Seguridad

### Cómo leer un reporte de Gitleaks

Gitleaks busca secretos filtrados (API keys, contraseñas, tokens) en el historial de Git.

```
Finding:  POSTGRES_PASSWORD=mi-contraseña-insegura
Secret:   mi-contraseña-insegura
RuleID:   generic-api-key
Entropy:  3.52
File:     .env
Line:     3
Commit:   abc1234
```

| Campo | Significado |
|-------|-------------|
| `Finding` | La línea completa donde se encontró el secreto |
| `Secret` | El valor detectado como secreto |
| `RuleID` | La regla que lo detectó (ej. `generic-api-key`, `private-key`) |
| `Entropy` | Medida de aleatoriedad (mayor = más probable que sea un secreto real) |
| `File` | Archivo donde se encontró |
| `Commit` | Hash del commit donde se introdujo |

**Acción**: Si es un secreto real, rotarlo inmediatamente y eliminarlo del historial de Git.

### Cómo leer un reporte de Bandit

Bandit analiza código Python buscando patrones inseguros (SAST).

```
>> Issue: [B105:hardcoded_password_string] Possible hardcoded password: 'admin123'
   Severity: Low   Confidence: Medium
   Location: app/config.py:15
```

| Severidad | Significado | Acción |
|-----------|-------------|--------|
| **High** | Vulnerabilidad explotable | Corregir inmediatamente |
| **Medium** | Riesgo potencial | Evaluar y corregir si aplica |
| **Low** | Buena práctica no seguida | Evaluar si es relevante |

**Códigos comunes**: `B105` (contraseña hardcoded), `B301` (pickle inseguro), `B608` (SQL injection).

### Cómo leer un reporte de Trivy

Trivy escanea dependencias (SCA) e imágenes Docker buscando CVEs conocidos.

```
Total: 3 (HIGH: 2, CRITICAL: 1)

┌──────────────────┬────────────────┬──────────┬────────────────┬───────────────┐
│     Library      │ Vulnerability  │ Severity │ Installed Ver. │  Fixed Ver.   │
├──────────────────┼────────────────┼──────────┼────────────────┼───────────────┤
│ python-jose      │ CVE-2024-33663 │ CRITICAL │ 3.3.0          │ (ninguna)     │
│ python-multipart │ CVE-2024-53981 │ HIGH     │ 0.0.16         │ 0.0.22        │
│ setuptools       │ CVE-2024-6345  │ HIGH     │ 69.0.0         │ 70.0.0        │
└──────────────────┴────────────────┴──────────┴────────────────┴───────────────┘
```

| Severidad | Política del pipeline | Acción |
|-----------|----------------------|--------|
| **CRITICAL** | ❌ **Pipeline FALLA** | Obligatorio corregir antes de merge |
| **HIGH** | ❌ **Pipeline FALLA** (en SCA) | Actualizar dependencia a versión fija |
| **MEDIUM** | ⚠️ Reporta (no bloquea) | Evaluar riesgo y planificar corrección |
| **LOW** | ℹ️ Informativo | Documentar si se acepta el riesgo |

**Acción**: Actualizar la dependencia a la versión `Fixed Ver.` indicada. Si no hay fix, migrar a alternativa (como hicimos con python-jose → PyJWT).

### Cómo leer un reporte de OWASP ZAP

ZAP realiza análisis dinámico (DAST) escaneando la API en ejecución.

```
WARN-NEW: Content Security Policy (CSP) Header Not Set [10038]
WARN-NEW: Missing Anti-clickjacking Header [10020]
WARN-NEW: X-Content-Type-Options Header Missing [10021]
PASS: SQL Injection [40018]
PASS: Cross Site Scripting (Reflected) [40012]
```

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| **FAIL** | Vulnerabilidad confirmada | Corregir inmediatamente |
| **WARN-NEW** | Alerta nueva detectada | Evaluar si aplica al contexto |
| **WARN-INPROG** | Alerta en proceso de resolución | Continuar remediación |
| **PASS** | Prueba superada | No requiere acción |

**Nota**: En nuestro proyecto, los headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `HSTS`) ya están implementados en el middleware de FastAPI (`main.py`), lo que mitiga varias de las alertas comunes de ZAP.

### Cómo leer un reporte de Checkov

Checkov analiza la configuración de infraestructura (Dockerfiles, docker-compose, Terraform).

```
Passed checks: 12, Failed checks: 3, Skipped checks: 2

Check: CKV_DOCKER_2: "Ensure that HEALTHCHECK instructions have been added"
  FAILED for resource: api-gateway/Dockerfile
  
Check: CKV_DOCKER_3: "Ensure that a user for the container has been created"
  PASSED for resource: api-gateway/Dockerfile
```

| Resultado | Significado |
|-----------|-------------|
| **PASSED** | La configuración cumple la buena práctica |
| **FAILED** | La configuración no cumple — evaluar si es relevante |
| **SKIPPED** | Check excluido por configuración (`skip_check` en pipeline) |

**Nota**: Algunos checks se excluyen intencionalmente con `skip_check` en el pipeline cuando no son aplicables al contexto del proyecto (ej. `CKV_DOCKER_2` si el healthcheck se define en docker-compose).

