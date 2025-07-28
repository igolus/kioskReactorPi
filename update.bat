@echo off

:: Exécuter le script bash
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh

:: Vérifie si l'argument "reboot" est passé
IF /I "%1"=="reboot" (
    echo Redémarrage de la machine...
    shutdown /r /t 5
)