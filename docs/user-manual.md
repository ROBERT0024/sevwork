# Manual de Usuario — Secure Workspace

## Introducción

Secure Workspace es una aplicación web para gestionar notas y espacios de trabajo de forma segura. Este manual explica cómo usar todas las funcionalidades disponibles.

## Acceso a la Aplicación

Abre tu navegador web y ve a:

```
http://localhost:3000
```

## Registro de Usuario

1. En la pantalla de inicio, haz clic en **"¿No tienes cuenta? Regístrate"**.
2. Completa los campos:
   - **Correo electrónico**: Tu dirección de email (ejemplo: `usuario@correo.com`).
   - **Contraseña**: Mínimo 8 caracteres. Se recomienda usar letras, números y símbolos.
3. Haz clic en **"Crear cuenta"**.
4. Si el registro es exitoso, se iniciará sesión automáticamente.

### Errores comunes al registrarse

| Error | Causa | Solución |
|-------|-------|----------|
| "El email ya está registrado" | Ya existe una cuenta con ese correo | Usa otro email o inicia sesión |
| Error de validación | Contraseña muy corta | Usa al menos 8 caracteres |

## Inicio de Sesión

1. Ingresa tu **correo electrónico** y **contraseña**.
2. Haz clic en **"Iniciar sesión"**.
3. Serás redirigido al **Dashboard** (panel principal).

> **Nota de seguridad**: Tu sesión expira automáticamente después de 30 minutos de inactividad. Esto protege tu cuenta si olvidas cerrar sesión.

## Dashboard — Panel Principal

Al ingresar verás tres secciones principales:

### Espacios de Trabajo (sidebar izquierdo)

Los espacios de trabajo son como carpetas para organizar tus notas.

- **Crear un espacio**: Automáticamente se crea "Mi Espacio" la primera vez.
- **Seleccionar un espacio**: Haz clic en el nombre del espacio para ver sus notas.

### Crear una Nota

1. En la sección **"Nueva Nota"**:
   - Escribe el **título** de la nota.
   - Escribe el **contenido** en el área de texto.
2. Haz clic en **"Crear nota"**.
3. La nota aparecerá en la lista inferior.

> **Dato interesante**: Un "worker" inteligente cuenta automáticamente las palabras de tu nota en segundo plano. Verás el conteo actualizado al recargar.

### Ver Notas

Las notas se muestran como tarjetas con:
- **Título** en negrita.
- **Contenido** (vista previa).
- **Conteo de palabras** (icono 📊).
- **Fecha de creación**.

### Eliminar una Nota

1. Haz clic en la **"×"** (equis) en la esquina superior derecha de la tarjeta de la nota.
2. La nota se eliminará inmediatamente.

> **Advertencia**: La eliminación es permanente. No hay opción de deshacer.

## Cerrar Sesión

1. Haz clic en **"Cerrar sesión"** en la esquina superior derecha.
2. Se borrará tu token de sesión y serás redirigido al login.

## Seguridad de tu Cuenta

| Medida | Descripción |
|--------|------------|
| 🔒 Contraseña encriptada | Tu contraseña se guarda como un hash bcrypt, nunca en texto plano |
| ⏱️ Sesión con expiración | El token de acceso expira en 30 minutos |
| 🛡️ Datos aislados | Solo tú puedes ver tus notas y espacios de trabajo |
| 🚫 Protección IDOR | El sistema verifica que eres el dueño antes de cada acción |

## API REST (para usuarios avanzados)

Si quieres interactuar con la API directamente, la documentación interactiva Swagger está disponible en:

```
http://localhost:8000/docs
```

### Endpoints disponibles

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| POST | `/auth/register` | Crear cuenta | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/workspaces/` | Listar espacios | Sí (JWT) |
| POST | `/workspaces/` | Crear espacio | Sí (JWT) |
| GET | `/notes/` | Listar notas | Sí (JWT) |
| POST | `/notes/` | Crear nota | Sí (JWT) |
| DELETE | `/notes/{id}` | Eliminar nota | Sí (JWT) |

## Preguntas Frecuentes

**¿Puedo acceder desde otro dispositivo?**
Sí, mientras estés en la misma red, accede usando la IP del servidor en lugar de `localhost`.

**¿Se guardan mis datos al apagar Docker?**
Sí, los datos se almacenan en un volumen persistente de Docker (`postgres_data`).

**¿Puedo recuperar una nota eliminada?**
No, la eliminación es permanente. Asegúrate antes de eliminar.

**¿Qué hago si olvido mi contraseña?**
Actualmente no hay funcionalidad de recuperación de contraseña. Contacta al administrador del sistema.
