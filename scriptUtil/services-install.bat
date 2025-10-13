@echo OFF

REM --------------------------------------------------------
REM --- Ce script sera execute a la fin de chaque ubdate ---
REM --------------------------------------------------------

REM Vérifie si on est admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Elevation des droits en cours...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)



REM Juste apres un update, on nettoie les ACL de windows
REM ----------------------------------------------------
cd Agent_Multi-Thread
call reset_acl.bat
cd ..

REM Procede a tous les service-install.bat pour chaque projet
REM --------------------------------------------------------- 
cd Agent_Multi-Thread
call service-install.bat
cd ..

cd Camera
call service-install.bat
cd ..

cd usb_scanner
call service-install.bat
cd ..


echo ---------------------------------------------------------------------
echo ---                                                               ---
echo ---            Tous les services ont etaient installes            ---
echo ---                                                               ---
echo ---------------------------------------------------------------------
