@echo off
chcp 65001 >nul
echo ============================================
echo   Aegisky Medusa - Production Build & Start
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Create logs directory
if not exist logs mkdir logs

echo [1/5] Stopping existing containers...
docker compose -f docker-compose.prod.yml down 2>nul

echo.
echo [2/5] Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Building storefront...
cd storefront
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Storefront build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/5] Starting Docker services (PostgreSQL, Redis)...
docker compose -f docker-compose.prod.yml up -d postgres redis meilisearch

echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [5/5] Starting application with PM2...
call npx pm2 delete all 2>nul
call npx pm2 start ecosystem.config.js --env production
call npx pm2 save

echo.
echo ============================================
echo   Production environment started!
echo ============================================
echo.
echo   Frontend:  http://localhost:8000
echo   Backend:   http://localhost:9000
echo   Admin:     http://localhost:9000/app
echo.
echo   To view logs:    pm2 logs
echo   To stop:         pm2 stop all
echo   To restart:      pm2 restart all
echo   To monitor:      pm2 monit
echo.
pause
