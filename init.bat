@echo off
REM One-Click Setup Script for Bytrix API (Windows)
REM This script prepares everything for: docker-compose up -d

setlocal enabledelayedexpansion

set DOMAIN=%1
set EMAIL=%2

if "!DOMAIN!"=="" set DOMAIN=file.bytrix.my.id
if "!EMAIL!"=="" set EMAIL=admin@example.com

cls
echo.
echo ========================================================
echo    Bytrix API - One-Click Setup
echo    Auto SSL Setup (docker-compose up -d ready^)
echo ========================================================
echo.
echo Configuration:
echo   Domain: %DOMAIN%
echo   Email:  %EMAIL%
echo.

REM Create directories
echo Creating directories...
if not exist "ssl\letsencrypt\live\%DOMAIN%" mkdir "ssl\letsencrypt\live\%DOMAIN%"
if not exist "ssl\certbot" mkdir ssl\certbot
if not exist "caddy\data" mkdir caddy\data
if not exist "caddy\config" mkdir caddy\config
if not exist "logs\nginx" mkdir logs\nginx
echo OK
echo.

REM Update .env
echo Updating .env...
if exist .env (
    powershell -Command "(Get-Content .env) -replace 'DOMAIN=.*', 'DOMAIN=https://%DOMAIN%' | Set-Content .env"
) else (
    (
        echo DOMAIN=https://%DOMAIN%
        echo EMAIL=%EMAIL%
    ) > .env
)
echo OK
echo.

REM Update nginx.conf
echo Updating nginx.conf...
if exist nginx.conf (
    powershell -Command "(Get-Content nginx.conf) -replace 'DOMAIN_PLACEHOLDER', '%DOMAIN%' | Set-Content nginx.conf"
)
echo OK
echo.

REM Make scripts executable (Windows doesn't need this, but for Docker)
echo Scripts ready for Docker
echo.

echo ========================================================
echo SETUP COMPLETE!
echo ========================================================
echo.
echo Next Step:
echo   docker-compose up -d
echo.
echo Then monitor:
echo   docker-compose logs -f certbot
echo   docker-compose logs -f nginx
echo   curl -k https://%DOMAIN%/health
echo.
echo ========================================================
echo.
