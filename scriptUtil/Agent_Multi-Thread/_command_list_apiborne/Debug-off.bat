@echo off
echo [INFO] --- DEBUG OFF : Désactive le remote debugging et retire le flag ---

REM Liste les redirection active
C:\Windows\System32\netsh interface portproxy show all

::REM 1. Trouver l'IP VPN (même logique que debug-on)
::FOR /F "tokens=2 delims=:" %%A IN ('ipconfig ^| findstr /R /C:"IPv4.*10\.10\."') DO (
::    SET IP_VPN=%%A
::)
::IF "%IP_VPN%"=="" (
::    echo [INFO] Aucune IP 10.10.x.x détectée, suppression forcée.
::) ELSE (
::    SET IP_VPN=%IP_VPN: =%
::    REM 2. Supprimer la redirection netsh
::    C:\Windows\System32\netsh interface portproxy delete v4tov4 listenaddress=%IP_VPN% listenport=9123
::)

echo "[INFO] --- Libere tous les proxy lances
C:\Windows\System32\netsh interface portproxy reset

C:\Windows\System32\netsh interface portproxy show all

REM Liste les ports en ecoute
echo "[INFO] --- Libere tous les ports en ecoute
C:\Windows\System32\netstat -an | findstr "LISTENING"

REM Supprimer le fichier de flag
if exist "C:\kioskreactor\temp\mode-debug-actif" del "C:\kioskreactor\temp\mode-debug-actif"

echo [OK] Remote debugging désactivé et fichier flag supprimé.

