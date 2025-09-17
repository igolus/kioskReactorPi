@echo off
echo "Updating the system"

REM Vérification optionnelle (via bash)
C:\cygwin64\bin\bash.exe -c "if [ -f '/etc/ansible-pull.conf' ]; then echo '✅ Configuration token détectée'; else echo '⚠️ Pas de token - mode repo public'; fi"

REM update principal
call C:\kioskReactor\update.bat reboot

echo "Update done !!"