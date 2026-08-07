@echo off
chcp 65001 >nul
echo ============================================
echo   Aegisky Medusa - Development Environment
echo ============================================
echo.

REM Create logs directory
if not exist logs mkdir logs

echo [1/4] Starting Docker services...
docker start aegisky-medusa-postgres aegisky-medusa-redis 2>nul
if %errorlevel% neq 0 (
    echo Starting fresh containers...
    docker compose up -d postgres redis
)

echo Waiting for services...
timeout /t 5 /nobreak >nul

echo.
echo [2/4] Starting Medusa backend on port 9000...
cd backend
start "Aegisky Backend" cmd /k "npx medusa develop"
cd ..

echo Waiting for backend to initialize...
timeout /t 15 /nobreak >nul

echo.
echo [3/4] Starting Next.js frontend on port 8000...
cd storefront
start "Aegisky Frontend" cmd /k "npm run dev -- -p 8000"
cd ..

echo Waiting for frontend...
timeout /t 20 /nobreak >nul

echo.
echo [4/4] Verifying services...
echo.

REM Test backend
curl -s http://localhost:9000/store/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Backend:  http://localhost:9000
) else (
    echo   [..] Backend is starting, check the backend window for status
)

REM Test frontend
curl -s http://localhost:8000/en >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Frontend: http://localhost:8000/en
) else (
    echo   [..] Frontend is starting, check the frontend window for status
)

echo.
echo ============================================
echo   Development environment started!
echo ============================================
echo.
echo   Frontend:  http://localhost:8000/en
echo   Backend:   http://localhost:9000
echo   Admin:     http://localhost:9000/app
echo.
echo   Admin login: admin@aegisky.com / admin123456
echo.
pause
