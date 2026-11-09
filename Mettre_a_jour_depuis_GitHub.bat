@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Amazon 4 colonnes - Update
if not exist "%~dp0Gestion_Git.ps1" (
 echo ERREUR : Gestion_Git.ps1 introuvable a cote de ce BAT.
 pause
 exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Gestion_Git.ps1" -Action Update
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%
