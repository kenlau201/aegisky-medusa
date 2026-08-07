@echo off
echo ========================================
echo   Aegisky Medusa - Database Backup
echo ========================================
echo.

cd /d "%~dp0"

echo Running backup...
node backup-db.js

echo.
echo Backup complete! Press any key to exit.
pause >nul
