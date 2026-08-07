@echo off
chcp 65001 >nul
echo ========================================
echo   Aegisky Medusa - Starting Platform
echo ========================================
echo.

cd /d "%~dp0storefront"

echo Starting Next.js on port 8000...
start "Aegisky Next.js" cmd /k "npm run dev -- -p 8000"

echo Waiting for server...
timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:8000/en

echo.
echo ========================================
echo   Platform started! http://localhost:8000/en
echo ========================================
echo.
pause
