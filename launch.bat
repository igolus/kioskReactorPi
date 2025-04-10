@echo on
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set DATE=%%i

:: Dossier de logs
set LOG_DIR=C:\kioskReactor\logs

:: Fichier log du jour
set LOG_FILE=%LOG_DIR%\log-%DATE%.log

:: Créer le dossier s’il n’existe pas
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Supprimer les logs de plus de 5 jours
forfiles /p "%LOG_DIR%" /m *.log /d -5 /c "cmd /c del @path"

:: Lancer le script bash et logger via tee
c:\cygwin64\bin\bash.exe -c "bash /cygdrive/c/kioskReactor/launchSystemWin.sh 2>&1 | tee -a /cygdrive/c/kioskReactor/logs/log-%DATE%.log"