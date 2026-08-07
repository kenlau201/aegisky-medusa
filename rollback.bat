@echo off
REM Aegisky Medusa - One-click Rollback Script
REM Sprint 3: Rollback Red Line - 3 minute rollback guarantee

echo ============================================
echo Aegisky Medusa - Emergency Rollback
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Checking deployment history...
node deploy.js current
echo.

echo [2/4] Initiating rollback to previous stable version...
node deploy.js rollback

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Rollback failed! Please check logs and try manual recovery.
    pause
    exit /b 1
)

echo.
echo [3/4] Verifying services...
timeout /t 10 /nobreak > nul

curl -s http://localhost:9000/store/health > nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backend health check failed, waiting 10 more seconds...
    timeout /t 10 /nobreak > nul
)

echo.
echo [4/4] Rollback complete!
echo.
echo ============================================
echo Services:
echo   - Frontend: http://localhost:8000
echo   - Backend:  http://localhost:9000
echo   - Admin:    http://localhost:8000/en/admin
echo ============================================
echo.
pause
