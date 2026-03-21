# Modelo de Amenazas — Secure Workspace

## Activos

| Activo | Sensibilidad | Ubicación |
|--------|-------------|-----------|
| Credenciales de usuario | ALTA | PostgreSQL (hash bcrypt) |
| Tokens JWT | ALTA | Lado del cliente (localStorage) |
| Contenido de notas | MEDIA | PostgreSQL |
| Secretos del entorno | ALTA | Archivos `.env`, secretos de CI/CD |

## Categorías de Amenazas (STRIDE)

### Suplantación (Spoofing)
- **Amenaza**: Un atacante falsifica la identidad para acceder a datos de otro usuario.
- **Mitigación**: JWT con expiración, hash de contraseñas con bcrypt, rotación de refresh tokens.

### Manipulación (Tampering)
- **Amenaza**: Modificación de datos en tránsito o en reposo.
- **Mitigación**: HTTPS en producción, validación de entradas con Pydantic, consultas SQL parametrizadas vía ORM SQLAlchemy.

### Repudio (Repudiation)
- **Amenaza**: El usuario niega haber realizado acciones.
- **Mitigación**: Logging estructurado con timestamps e IDs de usuario.

### Divulgación de Información (Information Disclosure)
- **Amenaza**: Secretos filtrados en código, logs o imágenes de contenedores.
- **Mitigación**: Gitleaks en CI, variables de entorno para secretos, contenedores no-root, escaneo de imágenes con Trivy.

### Denegación de Servicio (Denial of Service)
- **Amenaza**: Agotamiento de recursos en la API o base de datos.
- **Mitigación**: Rate limiting (futuro), connection pooling en SQLAlchemy.

### Elevación de Privilegios (Elevation of Privilege)
- **Amenaza**: Un usuario normal accede a endpoints de admin. IDOR para acceder a notas de otros usuarios.
- **Mitigación**: Decorador de control de acceso basado en roles, verificación de propiedad en cada consulta.

## Superficie de Ataque

| Punto de Entrada | Protocolo | Auth Requerida | Notas |
|-----------------|----------|----------------|-------|
| `POST /auth/register` | HTTP | No | Se recomienda rate limiting |
| `POST /auth/login` | HTTP | No | Se recomienda protección contra fuerza bruta |
| `GET/POST /workspaces` | HTTP | JWT | Limitado al usuario |
| `GET/POST/DELETE /notes` | HTTP | JWT | Se verifica propiedad |
| Redis | TCP | No (red interna) | No expuesto externamente |
| PostgreSQL | TCP | Contraseña | No expuesto externamente |
