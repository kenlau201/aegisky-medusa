@echo off
chcp 65001 >nul
title Aegisky Medusa 平台停止器
color 0C

echo ==============================================
echo    Aegisky B2B 平台 - 停止服务
echo ==============================================
echo.

echo [1/2] 停止所有 Medusa 容器...
cd /d "%~dp0"
docker compose down
echo ✅ 容器已停止
echo.

echo [2/2] 停止 Node.js 进程...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Node 进程已停止
echo.

echo ==============================================
echo ✅ Aegisky Medusa 平台已完全停止
echo ==============================================
echo.
pause
