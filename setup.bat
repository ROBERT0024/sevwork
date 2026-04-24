@echo off
setlocal enabledelayedexpansion
title Instalador Secure Workspace
cls

echo ========================================================
echo   🚀 BIENVENIDO AL INSTALADOR DE SECURE WORKSPACE
echo ========================================================
echo.

:: 1. Verificar si Docker está instalado
echo [1/4] 🔍 Verificando instalacion de Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker no esta instalado en este PC.
    echo.
    echo Por favor descarga e instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Despues de instalarlo, REINICIA esta ventana.
    pause
    exit /b
)
echo ✅ Docker esta instalado.

:: 2. Verificar si el motor de Docker (Daemon) está corriendo
echo [2/4] 🐳 Verificando que Docker este abierto y listo...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker esta instalado pero NO esta corriendo.
    echo.
    echo POR FAVOR SIGUE ESTOS PASOS:
    echo 1. Abre la aplicacion "Docker Desktop" en tu PC.
    echo 2. Espera a que el icono de la ballena (abajo a la derecha^) este en verde o diga "Running".
    echo 3. Si Docker Desktop ya esta abierto, cierralo y vuelvelo a abrir.
    echo 4. Una vez que Docker este listo, presiona cualquier tecla en esta ventana.
    echo.
    pause
    :: Re-verificar una vez mas
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        echo ❌ Sigue sin detectarse Docker corriendo. 
        echo Intenta ejecutar Docker Desktop como ADMINISTRADOR.
        pause
        exit /b
    )
)
echo ✅ Docker esta corriendo correctamente.

:: 3. Verificar conflictos de puertos
echo [3/4] 🔍 Verificando disponibilidad de puertos...
set "PORTS=3000 8000 5432 6379"
set "CONFLICT=0"

for %%p in (%PORTS%) do (
    netstat -ano | findstr /R /C:".:%%p " >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️ ALERTA: El puerto %%p ya esta siendo usado.
        set "CONFLICT=1"
    )
)

if %CONFLICT% equ 1 (
    echo.
    echo ❌ Hay conflictos de puertos. Si tienes instalado PostgreSQL localmente,
    echo Redis, u otra aplicacion en el puerto 3000, por favor cierralos.
    echo.
    echo Intentaremos continuar, pero es posible que falle.
    pause
) else (
    echo ✅ Todos los puertos necesarios estan libres.
)

:: 4. Configurar variables de entorno
if not exist .env (
    echo [4/4] 📄 Creando archivo de configuracion .env...
    copy .env.example .env >nul
    echo ✅ Archivo .env creado desde la plantilla.
) else (
    echo [4/4] ✅ El archivo .env ya existe.
)

:: 5. Levantar contenedores
echo.
echo 🏗️  Levantando servicios (esto puede tardar unos minutos^)...
echo.

:: Intentar con 'docker compose' (V2) primero, luego 'docker-compose' (V1)
set "DOCKER_CMD=docker compose"
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    set "DOCKER_CMD=docker-compose"
)

%DOCKER_CMD% up -d --build

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: No se pudieron levantar los contenedores.
    echo.
    echo Sugerencias:
    echo - Asegurate de tener conexion a internet.
    echo - Ejecuta: %DOCKER_CMD% down para limpiar estados previos.
    echo - Revisa que Docker Desktop tenga habilitado "WSL 2 based engine" en Settings.
    echo.
    pause
    exit /b
)

:: 6. Finalización
echo.
echo 🌐 Todo listo. Abriendo la aplicacion en: http://localhost:3000
timeout /t 5 >nul
start http://localhost:3000

echo.
echo ========================================================
echo   ✅ ¡INSTALACION COMPLETADA CON EXITO!
echo ========================================================
echo.
echo Ya puedes cerrar esta ventana y usar la aplicacion.
echo.
pause

