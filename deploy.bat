@echo off
REM Aegisky Medusa - Production Deploy Script
REM Sprint 3: Versioned deployment with rollback support

echo ============================================
echo Aegisky Medusa - Production Deployment
echo ============================================
echo.

cd /d "%~dp0"

REM Get version
for /f "tokens=*" %%i in ('node -e "const d=new Date();const p=n=>String(n).padStart(2,'0');console.log('v'+d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes()))"') do set VERSION=%%i

echo Deploying version: %VERSION%
echo.

REM Step 1: Build images
echo [1/5] Building Docker images...
docker build -f backend/Dockerfile.prod -t aegisky/backend:%VERSION% ./backend
if %ERRORLEVEL% NEQ 0 goto :build_error

docker build -f storefront/Dockerfile.prod -t aegisky/frontend:%VERSION% ./storefront
if %ERRORLEVEL% NEQ 0 goto :build_error

REM Tag as latest
docker tag aegisky/backend:%VERSION% aegisky/backend:latest
docker tag aegisky/frontend:%VERSION% aegisky/frontend:latest

echo [2/5] Stopping old containers...
docker compose -f docker-compose.prod.yml stop backend frontend

echo [3/5] Starting new version...
docker compose -f docker-compose.prod.yml up -d

echo [4/5] Waiting for health check (max 60s)...
set HEALTHY=0
for /l %%i in (1,1,12) do (
    timeout /t 5 /nobreak > nul
    curl -s http://localhost:9000/store/health | findstr "ok" > nul
    if not ERRORLEVEL 1 (
        set HEALTHY=1
        goto :healthy
    )
    echo   Waiting... attempt %%i/12
)

:healthy
if "%HEALTHY%"=="0" (
    echo.
    echo [ERROR] Health check failed!
    echo.
    echo Options:
    echo   1. Wait longer and check manually
    echo   2. Rollback immediately (run rollback.bat)
    echo.
    choice /c 12 /m "Choose option"
    if ERRORLEVEL 2 goto :autorollback
    goto :done
)

echo [5/5] Marking deployment as stable...
node deploy.js confirm %VERSION%

echo.
echo ============================================
echo DEPLOYMENT SUCCESSFUL
echo Version: %VERSION%
echo.
echo Services:
echo   - Frontend: http://localhost:8000
echo   - Backend:  http://localhost:9000
echo   - Admin:    http://localhost:8000/en/admin
echo.
echo If issues occur, run rollback.bat to revert
echo ============================================
goto :done

:build_error
echo.
echo [ERROR] Docker build failed. Deployment aborted.
echo Previous version remains running.
pause
exit /b 1

:autorollback
echo.
echo Auto-rolling back...
call rollback.bat
exit /b 1

:done
echo.
pause
