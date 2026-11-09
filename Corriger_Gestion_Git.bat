@echo off
setlocal EnableExtensions DisableDelayedExpansion
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Corriger_Gestion_Git.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%
