#!/bin/bash

echo "========================================================"
echo "  🚀 BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE"
echo "========================================================"
echo

# 1. Copiar archivo .env si no existe
if [ ! -f .env ]; then
    echo "[1/3] 📄 Configurando variables de entorno..."
    cp .env.example .env
else
    echo "[1/3] ✅ El archivo .env ya existe."
fi

# 2. Levantar Docker
echo "[2/3] 🐳 Levantando contenedores..."
echo "(Esto puede tardar varios minutos si es la primera vez)"
echo
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo
    echo "❌ ERROR: No se pudo levantar Docker."
    echo "ASEGURATE DE QUE DOCKER ESTE CORRIENDO."
    exit 1
fi

# 3. Abrir la página automáticamente
echo
echo "[3/3] 🌐 Todo listo. Abriendo la aplicacion en el navegador..."
sleep 5

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
else
    echo "Por favor abre manualmente: http://localhost:3000"
fi

echo
echo "========================================================"
echo "  ✅ ¡INSTALACION COMPLETADA EXITOSAMENTE!"
echo "========================================================"
echo
