@echo off
setlocal
set service_name=camera

:: Arrêt du service
call "%~dp0service-stop.bat"

:: Suppression du service
sc query "%service_name%" >nul 2>&1
if %errorlevel%==0 (
    echo Suppression du service "%service_name%"...
    nssm remove "%service_name%" confirm
) else (
    echo Service "%service_name%" non trouve.
)
endlocal
