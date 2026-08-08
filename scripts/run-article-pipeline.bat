@echo off
REM ============================================================
REM  Aegisky GUTN - Article Pipeline Scheduled Task
REM  Runs GEO-driven article collection and lifecycle management
REM
REM  Schedule: Daily at 3:00 AM
REM  Run via: Windows Task Scheduler
REM ============================================================

setlocal

REM Configuration
set PROJECT_DIR=D:\项目备份\Aegisky-Medusa\aegisky-medusa
set STOREFRONT_DIR=%PROJECT_DIR%\storefront
set LOG_DIR=%PROJECT_DIR%\logs
set LOG_FILE=%LOG_DIR%\article-pipeline-%date:~0,4%%date:~5,2%%date:~8,2%.log

REM Ensure log directory exists
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ============================================================ >> "%LOG_FILE%"
echo  Article Pipeline Run - %date% %time% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

REM Change to storefront directory
cd /d "%STOREFRONT_DIR%"

REM Run the pipeline
echo Running article pipeline... >> "%LOG_FILE%"
npx tsx src/lib/suppliers/run-article-pipeline.ts >> "%LOG_FILE%" 2>&1

echo. >> "%LOG_FILE%"
echo Pipeline completed at %time% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

REM Clean up logs older than 30 days
forfiles /p "%LOG_DIR%" /m article-pipeline-*.log /d -30 /c "cmd /c del @path" 2>nul

endlocal
