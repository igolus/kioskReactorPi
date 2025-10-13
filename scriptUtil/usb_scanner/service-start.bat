@echo off
setlocal
set service_name=usb_scanner


sc query "%service_name%" | find "RUNNING" >nul
if %errorlevel%==0 (
    echo Service "%service_name%" deja demarre.
) else (
    echo Demarrage du service "%service_name%"...
    sc start "%service_name%"
)
endlocal
