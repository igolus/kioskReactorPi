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

REM Purge des logs (C:\kioskReactor\logs, 15 jours) : ICI et pas dans
REM launchSystemWin.sh. On est eleve (admin), les ACL viennent d'etre
REM remises au propre par reset_acl.bat, et les services nssm qui ecrivent
REM dans ce dossier ne sont pas encore (re)installes. Le script ne touche
REM jamais au log du jour ni aux ACL (cf. C:\kioskReactor\purgeLogs.sh).
REM ---------------------------------------------------------------------
call c:\cygwin64\bin\bash.exe C:\kioskReactor\purgeLogs.sh

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
