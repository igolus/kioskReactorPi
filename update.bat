@echo off

:: Exécuter le script bash
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh

:: Vérifie si l'argument "reboot" est passé
IF /I "%1"=="reboot" (

    echo Redémarrage de la machine...
    powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::MsgBox('Mise à jour terminée. Le système va redémarrer dans 5 secondes.', 'OKOnly,Information', 'Mise à jour')"
    shutdown /r /t 5
)
