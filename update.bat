@echo on

:: Exécuter le script bash
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh

echo update camera

cd c:\kioskReactor\scriptUtil\Camera\
call c:\kioskReactor\scriptUtil\Camera\service-install.bat

REM Installation des services pour demarrage automatique avec Windows
echo Update Agent_Multi-Thread...
cd c:\kioskReactor\scriptUtil\Agent_Multi-Thread\
call c:\kioskReactor\scriptUtil\Agent_Multi-Thread\service-install.bat

:: Vérifie si l'argument "reboot" est passé
IF /I "%1"=="reboot" (

    echo Redémarrage de la machine...
    powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::MsgBox('Mise à jour terminée. Le système va redémarrer dans 5 secondes.', 'OKOnly,Information', 'Mise à jour')"
    shutdown /r /t 5
)
