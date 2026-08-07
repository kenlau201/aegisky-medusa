@echo off
chcp 65001 >nul
echo ============================================
echo   Aegisky Medusa - Stop All Services
echo ============================================
echo.

echo Stopping PM2 processes...
call npx pm2 delete all 2>nul

echo.
echo Stopping processes on ports 8000 and 9000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo   Killing process on port 8000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9000 " ^| findstr "LISTENING"') do (
    echo   Killing process on port 9000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Do you want to stop Docker containers (PostgreSQL, Redis)?
choice /C YN /M "Enter Y to stop Docker, N to keep them running"
if %errorlevel% equ 1 (
    echo Stopping Docker containers...
    docker stop aegisky-medusa-postgres aegisky-medusa-redis 2>nul
    docker compose down 2>nul
    echo Docker containers stopped.
) else (
    echo Docker containers kept running.
)

echo.
echo ============================================
echo   All services stopped.
echo ============================================
pause
