@echo off
echo [INFO] --- DEBUG OFF : Désactive le remote debugging et retire le flag ---

::REM 1. Trouver l'IP VPN (même logique que debug-on)
::FOR /F "tokens=2 delims=:" %%A IN ('ipconfig ^| findstr /R /C:"IPv4.*10\.10\."') DO (
::    SET IP_VPN=%%A
::)
::IF "%IP_VPN%"=="" (
::    echo [INFO] Aucune IP 10.10.x.x détectée, suppression forcée.
::) ELSE (
::    SET IP_VPN=%IP_VPN: =%
::    REM 2. Supprimer la redirection netsh
::    netsh interface portproxy delete v4tov4 listenaddress=%IP_VPN% listenport=9222
::)

::REM 3. Supprimer la règle firewall
::netsh advfirewall firewall delete rule name="RemoteDebug9222"

REM 4. Supprimer le fichier de flag
if exist "C:\kioskreactor\temp\mode-debug-actif" del "C:\kioskreactor\temp\mode-debug-actif"

echo [OK] Remote debugging désactivé et fichier flag supprimé.

