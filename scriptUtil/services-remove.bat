@echo OFF
REM ---------------------------------------------------
REM --- Ce script sera execute en manuel uniquement ---
REM ---------------------------------------------------


REM Vérifie si on est admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Elevation des droits en cours...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)



REM Procede a tous les service-remove.bat pour chaque projet
REM --------------------------------------------------------- 
cd Agent_Multi-Thread
call service-stop.bat
call service-remove.bat
cd ..

cd Camera
call service-stop.bat
call service-remove.bat
cd ..

cd usb_scanner
call service-stop.bat
call service-remove.bat
cd ..


REM relance services-install.bat
REM ----------------------------
REM call services-install.bat

echo ---------------------------------------------------------------------
echo ---                                                               ---
echo --- N'oubliez pas de re-installer les services avec la commande : ---
echo ---                                                               ---
echo ---                                                               ---
echo ---                    services-install.bat                       ---
echo ---                                                               ---
echo ---------------------------------------------------------------------
