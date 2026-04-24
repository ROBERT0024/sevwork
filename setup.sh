#!/bin/bash

echo "========================================================"
echo "  🚀 BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE"
echo "========================================================"
echo

# 1. Verificar si Docker está instalado
echo "[1/4] 🔍 Verificando instalacion de Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no esta instalado."
    echo "Por favor instala Docker Desktop o Docker Engine primero."
    exit 1
fi
echo "✅ Docker esta instalado."

# 2. Verificar si el motor de Docker esta corriendo
echo "[2/4] 🐳 Verificando que Docker este iniciado..."
if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker no esta corriendo."
    echo "Asegurate de que Docker Desktop este abierto y el motor este iniciado."
    exit 1
fi
echo "✅ Docker esta corriendo correctamente."

# 3. Configurar variables de entorno
if [ ! -f .env ]; then
    echo "[3/4] 📄 Creando archivo .env desde plantilla..."
    cp .env.example .env
else
    echo "[3/4] ✅ El archivo .env ya existe."
fi

# 4. Levantar contenedores
echo "[4/4] 🏗️  Levantando contenedores..."
echo "(Esto puede tardar varios minutos si es la primera vez)"
echo

# Detectar comando (docker compose vs docker-compose)
if docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi

$DOCKER_CMD up -d --build

if [ $? -ne 0 ]; then
    echo
    echo "❌ ERROR: No se pudo levantar Docker."
    echo "Intenta ejecutar: $DOCKER_CMD down y vuelve a intentar."
    exit 1
fi

# 5. Abrir la página automáticamente
echo
echo "🌐 Todo listo. Abriendo la aplicacion en el navegador..."
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

