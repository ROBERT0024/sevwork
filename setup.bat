@echo off
setlocal enabledelayedexpansion
title Instalador Secure Workspace
cls

echo ========================================================
echo   BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE
echo ========================================================
echo.

:: 1. Verificar Docker
echo [1/5] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado.
    pause
    exit /b
)
echo OK: Docker detectado.

:: 2. Verificar Motor
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo. Abre Docker Desktop primero.
    pause
    exit /b
)

:: 3. Detectar Comando
set "DOCKER_CMD=docker compose"
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    set "DOCKER_CMD=docker-compose"
)

:: 4. Seleccion de Modo
echo.
echo SELECCIONA EL MODO:
echo 1. Modo LOCAL (Build desde codigo)
echo 2. Modo DOCKER HUB (Bajar imagenes listas)
echo.
set /p MODO="Elige 1 o 2: "

if "%MODO%"=="2" (
    set "COMPOSE_FILE=docker-compose.hub.yml"
    set "BUILD_FLAG="
    set "MODO_NOMBRE=Docker Hub"
) else (
    set "COMPOSE_FILE=docker-compose.yml"
    set "BUILD_FLAG=--build"
    set "MODO_NOMBRE=Local"
)

:: 5. Puertos y Env
if not exist .env (
    copy .env.example .env >nul
)

:: 6. Levantar
echo.
echo Levantando servicios en modo !MODO_NOMBRE!...
echo (NOTA: La primera vez puede tardar unos 5 minutos bajando imagenes. No cierres esta ventana.)
echo.
if "%MODO%"=="2" (
    echo Descargando imagenes...
    %DOCKER_CMD% -f !COMPOSE_FILE! pull
)

%DOCKER_CMD% -f !COMPOSE_FILE! up -d !BUILD_FLAG!

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudieron levantar los contenedores.
    pause
    exit /b
)

echo.
echo TODO LISTO: http://localhost:3000/dashboard
timeout /t 5 >nul
start http://localhost:3000/dashboard
pause
