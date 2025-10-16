@echo off

REM Exécuter le script bash
REM -----------------------
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh
REM -----------------------


REM Check les installations de service
REM ----------------------------------
cd c:\kioskReactor\scriptUtil\
call services-install.bat
REM ----------------------------------


REM Vérifie si l'argument "reboot" est passé
REM ----------------------------------------
IF /I "%1"=="reboot" (

    echo Redémarrage de la machine...
    powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::MsgBox('Mise à jour terminée. Le système va redémarrer dans 5 secondes.', 'OKOnly,Information', 'Mise à jour')"
    shutdown /r /t 5
)
REM ----------------------------------------
