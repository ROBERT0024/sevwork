# 🚀 Guía de Instalación — Secure Workspace

## Cómo hacer funcionar este proyecto en TU computador (paso a paso)

> **¿Eres nuevo?** No te preocupes. Esta guía está diseñada para que puedas levantar todo el proyecto sin experiencia previa. Solo sigue los pasos en orden.

---

## 📋 Tabla de Contenido

1. [MODO FÁCIL: Un Solo Clic (Recomendado)](#⭐-modo-fácil-un-solo-clic-recomendado)
2. [MODO DOCKER HUB: Sin Compilar Nada](#-modo-docker-hub-sin-compilar-nada-alternativa-rápida)
3. [Requisitos (qué necesitas instalar ANTES)](#-paso-0--requisitos-previos)
4. [Clonar el proyecto](#-paso-1--clonar-el-repositorio)
5. [Configurar variables de entorno](#-paso-2--configurar-el-archivo-env)
6. [Encender Docker Desktop](#-paso-3--encender-docker-desktop)
7. [Levantar el proyecto](#-paso-4--levantar-el-proyecto-con-docker)
8. [Abrir la aplicación](#-paso-5--abrir-la-aplicación-en-el-navegador)
9. [Apagar el proyecto](#-paso-6--apagar-el-proyecto)
10. [Solución de problemas](#-solución-de-problemas-comunes)
11. [Notas importantes](#-notas-importantes)

---

## ⭐ MODO FÁCIL: Un Solo Clic (Recomendado)

Si no quieres usar la terminal ni escribir comandos, haz esto:

1. Asegúrate de tener **Docker Desktop** abierto.
2. **Entra a la carpeta** del proyecto (`sevwork`).
3. Busca el archivo correspondiente a tu sistema:
   - **En Windows:** Haz doble clic en el archivo `setup.bat`.
   - **En Mac o Linux:** Abre una terminal en la carpeta y escribe `sh setup.sh`.
4. **Elige el modo de ejecución** cuando te lo pregunte:
   - **Opción 1 — Modo Local:** Construye todo desde el código fuente (ideal si quieres desarrollar o modificaste algo).
   - **Opción 2 — Modo Docker Hub:** Descarga las imágenes ya construidas (más rápido, no compila nada).
5. El script hará todo el trabajo sucio por ti:
   - Verificará si Docker está realmente iniciado.
   - Revisará si hay conflictos de puertos.
   - Creará el archivo de configuración `.env` automáticamente.
   - Te abrirá el navegador cuando todo esté listo.

---

## 🐳 MODO DOCKER HUB: Sin Compilar Nada (Alternativa Rápida)

Si prefieres **no clonar el repositorio completo** o quieres la forma más rápida de probar la aplicación, puedes usar las imágenes pre-construidas que publicamos en [Docker Hub](https://hub.docker.com/r/robert0024/sevwork).

### ¿Qué necesitas?

| Requisito | ¿Por qué? |
|-----------|-----------|
| **Docker Desktop** instalado y corriendo | Para ejecutar los contenedores |
| **Archivo `docker-compose.hub.yml`** | Define qué imágenes descargar |
| **Archivo `.env`** | Configuración de contraseñas y conexiones |

> [!TIP]
> **No necesitas Git, Python, Node.js ni nada más.** Solo Docker Desktop y dos archivos.

### Paso a Paso

#### 1. Descarga los 2 archivos necesarios

Descárgalos directamente desde GitHub:

- 📄 [`docker-compose.hub.yml`](https://raw.githubusercontent.com/ROBERT0024/sevwork/main/docker-compose.hub.yml)
- 📄 [`.env.example`](https://raw.githubusercontent.com/ROBERT0024/sevwork/main/.env.example)

Ponlos en **una misma carpeta** en tu computador (por ejemplo, `C:\SecureWorkspace\` o `~/secure-workspace/`).

#### 2. Renombra `.env.example` a `.env`

```powershell
# Windows PowerShell
Rename-Item .env.example .env

# Windows CMD
ren .env.example .env

# Mac/Linux
mv .env.example .env
```

#### 3. Abre Docker Desktop

Espera a que el ícono de la ballena 🐳 esté quieto (sin animación = listo).

#### 4. Levanta los servicios

Abre una terminal en la carpeta donde guardaste los archivos y ejecuta:

```bash
docker compose -f docker-compose.hub.yml up -d
```

> [!NOTE]
> **La primera vez descarga ~500 MB** de imágenes. Las siguientes veces arrancará en segundos.

#### 5. Abre la aplicación

👉 **[http://localhost:3000](http://localhost:3000)**

### Apagar los servicios (Modo Docker Hub)

```bash
docker compose -f docker-compose.hub.yml down
```

### Imágenes disponibles en Docker Hub

| Imagen | Descripción |
|--------|-------------|
| `robert0024/sevwork:api-latest` | API Gateway (FastAPI) |
| `robert0024/sevwork:worker-latest` | Worker Celery |
| `robert0024/sevwork:frontend-latest` | Frontend (React + Nginx) |



## ⚙️ Paso 0 — Requisitos Previos

Antes de empezar, necesitas instalar **2 programas** en tu computador:

### 1. Git (para descargar el código)

- 📥 Descargar: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Instalar con las opciones por defecto (siguiente, siguiente, siguiente...)
- **¿Cómo saber si ya lo tengo?** Abre una terminal y escribe:
  ```
  git --version
  ```
  Si te muestra algo como `git version 2.xx.x`, ya lo tienes ✅

### 2. Docker Desktop (para correr los contenedores)

- 📥 Descargar: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- Instalar con las opciones por defecto
- **⚠️ IMPORTANTE:** En Windows, Docker te puede pedir instalar WSL 2. Si te lo pide, acepta y reinicia el computador.
- **¿Cómo saber si ya lo tengo?** Abre una terminal y escribe:
  ```
  docker --version
  ```
  Si te muestra algo como `Docker version 27.x.x`, ya lo tienes ✅

> [!CAUTION]
> **Docker Desktop DEBE estar abierto y corriendo** cada vez que quieras usar el proyecto. Si no está abierto, nada va a funcionar. Verifica que en la barra de tareas (abajo a la derecha) aparezca el ícono de la 🐳 ballena de Docker.

---

## 📂 Paso 1 — Clonar el Repositorio

Abre una terminal (PowerShell, CMD, o Git Bash) y escribe:

```bash
git clone https://github.com/ROBERT0024/sevwork.git
```

Esto descarga todo el proyecto en una carpeta llamada `sevwork`.

Ahora entra a la carpeta:

```bash
cd sevwork
```

> [!TIP]
> **¿Qué es "clonar"?** Es como descargar una copia exacta del proyecto desde GitHub a tu computador.

---

## 🔑 Paso 2 — Configurar el archivo .env

El proyecto necesita un archivo `.env` con las contraseñas y configuraciones. Ya viene un archivo de ejemplo listo para copiar.

### En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

### En Windows (CMD):

```cmd
copy .env.example .env
```

### En Mac o Linux:

```bash
cp .env.example .env
```

> [!NOTE]
> **NO necesitas modificar nada del archivo `.env` para desarrollo local.** Los valores que vienen por defecto funcionan perfectamente. Solo cópialo y listo.

### ¿Qué hay dentro del .env?

| Variable | Para qué sirve | Valor por defecto |
|----------|----------------|-------------------|
| `POSTGRES_USER` | Usuario de la base de datos | `securews` |
| `POSTGRES_PASSWORD` | Contraseña de la base de datos | `cambia_esta_contraseña_segura` |
| `POSTGRES_DB` | Nombre de la base de datos | `securews` |
| `DATABASE_URL` | Conexión completa a PostgreSQL | (se arma con los valores anteriores) |
| `JWT_SECRET_KEY` | Clave para firmar los tokens de login | `genera_una_clave_secreta_segura_aqui` |
| `REDIS_URL` | Conexión al broker de mensajes | `redis://redis:6379/0` |

---

## 🐳 Paso 3 — Encender Docker Desktop

1. **Busca "Docker Desktop"** en el menú de inicio de Windows (o en Aplicaciones en Mac).
2. **Ábrelo** y espera a que arranque completamente.
3. **Verificación:** El ícono de la 🐳 ballena en la barra de tareas debe estar **quieto** (si está animado, aún está cargando).

**¿Cómo verificar que Docker está listo?** Abre una terminal y escribe:

```bash
docker info
```

Si te muestra información del sistema (sin errores), Docker está listo ✅

> [!WARNING]
> Si dice algo como `Cannot connect to the Docker daemon`, significa que Docker Desktop NO está abierto. Ábrelo y espera unos segundos.

---

## 🏗️ Paso 4 — Levantar el Proyecto con Docker

**Este es el paso más importante.** Asegúrate de estar dentro de la carpeta `sevwork` y escribe:

```bash
docker-compose up --build -d
```

### ¿Qué hace este comando?

| Parte del Comando | Qué hace |
|-------------------|----------|
| `docker-compose` | Herramienta para manejar múltiples contenedores |
| `up` | Levantar (encender) todos los servicios |
| `--build` | Construir las imágenes desde el código fuente |
| `-d` | Ejecutar en segundo plano (para que no te ocupe la terminal) |

### ⏳ La primera vez tarda entre 3-8 minutos

La primera vez descarga todas las imágenes base (PostgreSQL, Redis, Node.js, Python, Nginx). **Esto es normal.** Las siguientes veces será mucho más rápido.

### ¿Cómo saber si todo levantó bien?

Escribe:

```bash
docker-compose ps
```

**Deberías ver algo como esto:**

```
NAME          IMAGE                  STATUS                    PORTS
sw-api        sevwork-api-gateway    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp
sw-frontend   sevwork-frontend       Up 2 minutes              0.0.0.0:3000->80/tcp
sw-postgres   postgres:15-alpine     Up 2 minutes (healthy)    0.0.0.0:5432->5432/tcp
sw-redis      redis:7-alpine         Up 2 minutes (healthy)    0.0.0.0:6379->6379/tcp
sw-worker     sevwork-worker         Up 2 minutes              
```

> [!IMPORTANT]
> **Todos los servicios deben decir "Up".** Si alguno dice "Exited" o "Restarting", revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes).

---

## 🌐 Paso 5 — Abrir la Aplicación en el Navegador

Una vez que todo esté "Up", abre tu navegador web (Chrome, Firefox, Edge, etc.) y ve a:

### 👉 [http://localhost:3000](http://localhost:3000)

Deberías ver la pantalla de **login de Secure Workspace** 🎉

### URLs disponibles

| URL | Qué es | Para qué sirve |
|-----|--------|-----------------|
| **http://localhost:3000** | 🖥️ Frontend (Aplicación) | **Esta es la que usas normalmente** |
| http://localhost:8000 | 🔧 API Backend | Muestra `{"status":"ok"}` si funciona |
| http://localhost:8000/docs | 📖 Documentación Swagger | Ver todos los endpoints de la API |

### Primera vez usando la app

1. Haz clic en **"Crear cuenta"** o **"Regístrate aquí"**
2. Ingresa un correo electrónico y una contraseña (mínimo 8 caracteres)
3. ¡Listo! Ya puedes crear notas y espacios de trabajo

---

## ⏹️ Paso 6 — Apagar el Proyecto

Cuando termines de usar la aplicación, apaga los contenedores:

```bash
docker-compose down
```

Esto apaga todos los servicios, pero **tus datos se mantienen** guardados (notas, usuarios, etc.).

### ¿Quieres borrar TODOS los datos y empezar de cero?

```bash
docker-compose down -v
```

> [!CAUTION]
> El flag `-v` **elimina permanentemente** la base de datos. Todas las notas, usuarios y datos se perderán. Solo úsalo si quieres empezar de cero.

### ¿Quieres volver a encender después?

```bash
docker-compose up -d
```

> [!NOTE]
> **No necesitas `--build` la segunda vez** a menos que hayas cambiado el código fuente. Sin `--build` arranca mucho más rápido.

---

## 🔄 Resumen Rápido (cheat sheet)

### Modo Local (docker-compose.yml)

| Quiero... | Comando |
|-----------|---------|
| Levantar todo (primera vez) | `docker-compose up --build -d` |
| Levantar todo (ya construido) | `docker-compose up -d` |
| Ver si todo está corriendo | `docker-compose ps` |
| Ver los logs (si algo falla) | `docker-compose logs -f` |
| Ver logs de un servicio específico | `docker-compose logs -f api-gateway` |
| Apagar todo (guardar datos) | `docker-compose down` |
| Apagar todo (borrar datos) | `docker-compose down -v` |
| Reiniciar un servicio | `docker-compose restart api-gateway` |
| Reconstruir después de cambiar código | `docker-compose up --build -d` |

### Modo Docker Hub (docker-compose.hub.yml)

| Quiero... | Comando |
|-----------|---------|
| Levantar todo (descarga imágenes) | `docker compose -f docker-compose.hub.yml up -d` |
| Ver si todo está corriendo | `docker compose -f docker-compose.hub.yml ps` |
| Ver los logs | `docker compose -f docker-compose.hub.yml logs -f` |
| Apagar todo (guardar datos) | `docker compose -f docker-compose.hub.yml down` |
| Apagar todo (borrar datos) | `docker compose -f docker-compose.hub.yml down -v` |
| Actualizar a la última versión | `docker compose -f docker-compose.hub.yml pull && docker compose -f docker-compose.hub.yml up -d` |

---

## 🆘 Solución de Problemas Comunes

### ❌ "Cannot connect to the Docker daemon"

**Causa:** Docker Desktop no está abierto.

**Solución:**
1. Abre Docker Desktop desde el menú de inicio
2. Espera a que el ícono de la ballena 🐳 deje de moverse
3. Intenta el comando de nuevo

---

### ❌ "port is already allocated" (puerto ya está en uso)

**Causa:** Otro programa está usando el puerto 3000, 8000, 5432 o 6379.

**Solución:**
```bash
# Ver qué está usando el puerto (ejemplo para el puerto 3000)
netstat -ano | findstr :3000

# Si encuentras algo, cierra ese programa o mata el proceso
taskkill /PID <numero_del_PID> /F
```

---

### ❌ El frontend carga pero muestra errores

**Causa:** El backend (API) aún no terminó de arrancar.

**Solución:**
1. Espera 30 segundos más
2. Verifica con: `docker-compose ps` (todos deben decir "Up" y "healthy")
3. Si el API dice "Restarting", mira los logs: `docker-compose logs api-gateway`

---

### ❌ "No such file or directory: .env"

**Causa:** Olvidaste copiar el archivo `.env`.

**Solución:**
```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

---

### ❌ La base de datos no conecta / "Connection refused"

**Causa:** PostgreSQL aún no terminó de arrancar o tiene un error.

**Solución:**
```bash
# Ver los logs de PostgreSQL
docker-compose logs postgres

# Si dice algo de "password authentication failed", reinicia todo:
docker-compose down -v
docker-compose up --build -d
```

---

### ❌ Todo está muy lento o se congela

**Causa:** Docker Desktop no tiene suficientes recursos.

**Solución:**
1. Abre Docker Desktop → ⚙️ Settings → Resources
2. Asigna al menos **4 GB de RAM** y **2 CPUs**
3. Click en "Apply & Restart"

---

### ❌ "WSL 2 installation is incomplete" (solo Windows)

**Causa:** Docker necesita WSL 2 en Windows.

**Solución:**
1. Abre PowerShell **como Administrador**
2. Escribe: `wsl --install`
3. Reinicia el computador
4. Abre Docker Desktop de nuevo

---

## 📝 Notas Importantes

> [!IMPORTANT]
> ### Para que todo funcione, recuerda estos puntos clave:

1. **🐳 Docker Desktop SIEMPRE debe estar abierto** antes de ejecutar cualquier comando `docker-compose`.

2. **📄 El archivo `.env` es obligatorio.** Sin él, los contenedores no pueden arrancar. Cópialo desde `.env.example`.

3. **⏳ La primera vez tarda.** Es normal que tarde 3-8 minutos la primera vez. Después será rápido (menos de 30 segundos).

4. **🌐 La app se abre en el puerto 3000**, no en el 8000. El 8000 es solo la API backend.

5. **💾 Los datos persisten** al apagar con `docker-compose down`. Solo se borran con `docker-compose down -v`.

6. **🔒 No compartas el archivo `.env`** con contraseñas reales en producción. Para desarrollo local, los valores por defecto están bien.

7. **📡 No necesitas instalar Python, Node.js, PostgreSQL ni Redis.** Todo viene empaquetado dentro de Docker. Solo necesitas Docker y Git.

---

## 🏛️ Arquitectura del Proyecto

El proyecto tiene 5 servicios que Docker levanta automáticamente:

```
┌──────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   📱 Frontend    │────▶│  🖥️ API Gateway  │────▶│  💾 PostgreSQL │
│   React + Vite   │     │     FastAPI       │     │   Base Datos   │
│   Puerto: 3000   │     │   Puerto: 8000   │     │  Puerto: 5432  │
└──────────────────┘     └────────┬─────────┘     └───────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐     ┌───────────────┐
                         │   ⚙️ Worker      │◀───▶│  🔴 Redis     │
                         │     Celery       │     │  Puerto: 6379  │
                         └──────────────────┘     └───────────────┘
```

| Servicio | Tecnología | Qué hace |
|----------|------------|----------|
| **Frontend** | React + Vite + Nginx | La interfaz visual que ves en el navegador |
| **API Gateway** | Python FastAPI | El backend que maneja la lógica, autenticación y datos |
| **Worker** | Python Celery | Procesa tareas en segundo plano (conteo de palabras, etc.) |
| **PostgreSQL** | Base de datos relacional | Almacena usuarios, notas y espacios de trabajo |
| **Redis** | Broker de mensajes | Comunica la API con el Worker |

---

## 🎬 Flujo Completo (de principio a fin)

```
1. Instalar Git y Docker Desktop
            ↓
2. git clone https://github.com/ROBERT0024/sevwork.git
            ↓
3. cd sevwork
            ↓
4. Copiar .env.example como .env
            ↓
5. Abrir Docker Desktop (esperar que cargue)
            ↓
6. docker-compose up --build -d
            ↓
7. Esperar 3-5 minutos (primera vez)
            ↓
8. docker-compose ps (verificar que todo diga "Up")
            ↓
9. Abrir http://localhost:3000 en el navegador
            ↓
10. ¡Listo! Crear cuenta y empezar a usar 🎉
```

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| **ROBERT0024** | Especialización en Ciberseguridad — DevSecOps |
| **diegohrnz89-ai** | Especialización en Ciberseguridad — DevSecOps |
| **Carlos.Gonzalez** | Especialización en Ciberseguridad — DevSecOps |
| **danielmaodaza** | Especialización en Ciberseguridad — DevSecOps |

---

> **¿Algo no funcionó?** Abre un issue en el repositorio de GitHub o contacta al equipo de desarrollo.
