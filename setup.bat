@echo off
title Instalador Secure Workspace
cls

echo ========================================================
echo   🚀 BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE
echo ========================================================
echo.

:: Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker no esta instalado. 
    echo Por favor instala Docker Desktop primero desde: https://www.docker.com/products/docker-desktop/
    pause
    exit /b
)

:: 1. Copiar archivo .env si no existe
if not exist .env (
    echo [1/3] 📄 Configurando variables de entorno...
    copy .env.example .env >nul
) else (
    echo [1/3] ✅ El archivo .env ya existe.
)

:: 2. Levantar Docker
echo [2/3] 🐳 Levantando contenedores... 
echo (Esto puede tardar varios minutos si es la primera vez^)
echo.
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: No se pudo levantar Docker. 
    echo ASEGURATE DE QUE DOCKER DESKTOP ESTE ABIERTO Y CORRIENDO.
    pause
    exit /b
)

:: 3. Abrir la página automáticamente
echo.
echo [3/3] 🌐 Todo listo. Abriendo la aplicacion en el navegador...
timeout /t 5 >nul
start http://localhost:3000

echo.
echo ========================================================
echo   ✅ ¡INSTALACION COMPLETADA EXITOSAMENTE!
echo ========================================================
echo.
echo Ya puedes cerrar esta ventana.
echo.
pause
