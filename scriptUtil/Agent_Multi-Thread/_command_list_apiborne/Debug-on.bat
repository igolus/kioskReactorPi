@echo off
echo [INFO] --- DEBUG ON : Active le remote debugging et le signale par un fichier ---

REM 1. Trouver l'IP VPN de la borne (adapté pour un VPN en 10.10.x.x)
FOR /F "tokens=2 delims=:" %%A IN ('ipconfig ^| findstr /R /C:"IPv4.*10\.10\."') DO (
    SET IP_VPN=%%A
)
IF "%IP_VPN%"=="" (
    echo [ERREUR] Aucune IP 10.10.x.x détectée sur cette machine.
    exit /b 1
)
SET IP_VPN=%IP_VPN: =%

REM 2. Configurer netsh portproxy
echo "[INFO] Creation du proxy : %IP_VPN%:9123 -> 127.0.0.1:9222"
C:\Windows\System32\netsh interface portproxy add v4tov4 listenaddress=%IP_VPN% listenport=9123 connectaddress=127.0.0.1 connectport=9222
C:\Windows\System32\netsh interface portproxy show all



REM Créer le fichier de flag
if not exist "C:\kioskreactor\temp" mkdir C:\kioskreactor\temp
echo Debug actif > "C:\kioskreactor\temp\mode-debug-actif"

echo [OK] Remote debugging actif, fichier flag créé.
