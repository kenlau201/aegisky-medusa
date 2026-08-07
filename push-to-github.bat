@echo off
echo ========================================
echo Aegisky Medusa - Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Configuring git for low memory...
"C:\Program Files\Git\bin\git.exe" config pack.windowMemory "256m"
"C:\Program Files\Git\bin\git.exe" config pack.packSizeLimit "256m"
"C:\Program Files\Git\bin\git.exe" config pack.threads "2"
"C:\Program Files\Git\bin\git.exe" config core.bigFileThreshold "10m"
"C:\Program Files\Git\bin\git.exe" config http.postBuffer "524288000"

echo.
echo Adding remote origin...
"C:\Program Files\Git\bin\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/kenlau201/aegisky-medusa.git

echo.
echo Pushing to GitHub...
echo Note: You will be prompted for GitHub credentials.
echo If you have 2FA enabled, use a Personal Access Token as password.
echo.

"C:\Program Files\Git\bin\git.exe" branch -M main
"C:\Program Files\Git\bin\git.exe" push -u origin main --force

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Code pushed to GitHub.
    echo Repository: https://github.com/kenlau201/aegisky-medusa
) else (
    echo Push failed. Please check your credentials and try again.
)
echo ========================================
echo.
pause
