@echo off
echo [INFO] --- DEBUG ON : Active le remote debugging et le signale par un fichier ---

REM 1. Trouver l'IP VPN de la borne (adapté pour un VPN en 10.10.2.x)
FOR /F "tokens=2 delims=:" %%A IN ('ipconfig ^| findstr /R /C:"IPv4.*10\.10\."') DO (
    SET IP_VPN=%%A
)
IF "%IP_VPN%"=="" (
    echo [ERREUR] Aucune IP 10.10.x.x détectée sur cette machine.
    exit /b 1
)
SET IP_VPN=%IP_VPN: =%

REM 2. Configurer netsh portproxy
netsh interface portproxy add v4tov4 listenaddress=%IP_VPN% listenport=9222 connectaddress=127.0.0.1 connectport=9222

::REM 3. Ouvrir le firewall pour tout le subnet 10.10.0.0/16
::netsh advfirewall firewall add rule name="RemoteDebug9222" dir=in action=allow protocol=TCP localport=9222 remoteip=10.10.0.0/16

REM 4. Créer le fichier de flag
echo Debug actif > "C:\mode-debug-actif"

echo [OK] Remote debugging actif sur %IP_VPN%:9222 et fichier flag créé.
