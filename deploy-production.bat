@echo off
echo ============================================================
echo   Aegisky Medusa - Production Deployment Script
echo   Sprint 4: Staging/Production
echo ============================================================
echo.

cd /d "%~dp0"

REM Check if .env.production exists
if not exist ".env.production" (
    echo [WARNING] .env.production not found!
    echo Copy .env.production.example to .env.production and fill in values.
    echo.
    pause
    exit /b 1
)

echo [1/6] Pulling latest changes...
git pull origin main

echo [2/6] Installing backend dependencies...
cd backend
call npm install --production --legacy-peer-deps
cd ..

echo [3/6] Installing frontend dependencies...
cd storefront
call npm install --production
cd ..

echo [4/6] Building frontend (Next.js production)...
cd storefront
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo [5/6] Running database migrations...
cd backend
call npx medusa db:migrate
cd ..

echo [6/6] Restarting services...
REM Stop existing services
call stop-all.bat

REM Start with PM2 or Windows services
REM Using PM2 for process management
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting with PM2...
    pm2 start ecosystem.config.js --env production
    pm2 save
) else (
    echo PM2 not found. Starting with start-production.bat...
    call start-production.bat
)

echo.
echo ============================================================
echo   Deployment complete!
echo   Frontend: https://aegisky.com
echo   Backend:  https://aegisky.com/store/health
echo   Admin:    https://aegisky.com/app
echo ============================================================
echo.
pause
