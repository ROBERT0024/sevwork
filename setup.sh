#!/bin/bash

echo "========================================================"
echo "  🚀 BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE"
echo "========================================================"
echo

# 1. Verificar si Docker está instalado
echo "[1/5] 🔍 Verificando instalacion de Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no esta instalado."
    echo "Por favor instala Docker Desktop o Docker Engine primero."
    exit 1
fi
echo "✅ Docker esta instalado."

# 2. Verificar si el motor de Docker esta corriendo
echo "[2/5] 🐳 Verificando que Docker este iniciado..."
if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker no esta corriendo."
    echo "Asegurate de que Docker Desktop este abierto y el motor este iniciado."
    exit 1
fi
echo "✅ Docker esta corriendo correctamente."

# 3. Selección de modo de ejecución
echo
echo "========================================================"
echo "  📦 SELECCIONA EL MODO DE EJECUCION"
echo "========================================================"
echo
echo "  1) 🏗️  Modo LOCAL (construir desde código fuente)"
echo "     → Usa el código del repositorio clonado."
echo "     → Ideal para desarrollo o si modificaste el código."
echo
echo "  2) 🐳 Modo DOCKER HUB (descargar imágenes pre-construidas)"
echo "     → Descarga las imágenes ya listas desde Docker Hub."
echo "     → Mas rápido, no necesita compilar nada."
echo
read -p "Elige una opcion [1/2] (por defecto: 1): " MODO
echo

if [ "$MODO" = "2" ]; then
    echo "✅ Modo seleccionado: DOCKER HUB (imágenes pre-construidas)"
    COMPOSE_FILE="docker-compose.hub.yml"
    BUILD_FLAG=""
else
    echo "✅ Modo seleccionado: LOCAL (construcción desde código fuente)"
    COMPOSE_FILE="docker-compose.yml"
    BUILD_FLAG="--build"
fi

# 4. Configurar variables de entorno
if [ ! -f .env ]; then
    echo "[3/5] 📄 Creando archivo .env desde plantilla..."
    cp .env.example .env
else
    echo "[3/5] ✅ El archivo .env ya existe."
fi

# 5. Levantar contenedores
echo "[4/5] 🏗️  Levantando contenedores con $COMPOSE_FILE..."
echo "(Esto puede tardar varios minutos si es la primera vez)"
echo

# Detectar comando (docker compose vs docker-compose)
if docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi

$DOCKER_CMD -f $COMPOSE_FILE up -d $BUILD_FLAG

if [ $? -ne 0 ]; then
    echo
    echo "❌ ERROR: No se pudo levantar Docker."
    echo "Intenta ejecutar: $DOCKER_CMD -f $COMPOSE_FILE down y vuelve a intentar."
    exit 1
fi

# 6. Abrir la página automáticamente
echo
echo "[5/5] 🌐 Todo listo. Abriendo la aplicacion en el navegador..."
sleep 5

URL="http://localhost:3000"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open $URL
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open $URL
else
    echo "Por favor abre manualmente: $URL"
fi

echo
echo "========================================================"
echo "  ✅ ¡INSTALACION COMPLETADA EXITOSAMENTE!"
echo "========================================================"
echo
echo "  Modo: $([ "$MODO" = "2" ] && echo "Docker Hub" || echo "Local")"
echo "  Archivo: $COMPOSE_FILE"
echo "  App:  http://localhost:3000"
echo "  API:  http://localhost:8000"
echo
