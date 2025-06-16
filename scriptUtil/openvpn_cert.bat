@echo on
setlocal

cd "C:\kioskReactor\scriptUtil"

set INFOSYS="C:\kioskReactor\conf\device.json"
set CONFIG="C:\Program Files\OpenVPN\config\APIBORNE.ovpn"
set JSONTMP="%TEMP%\openvpn_cert_retour.json"

rem 1. Vérifier si le fichier existe déjà
if exist %CONFIG% (
    echo Le fichier de configuration existe déjà : %CONFIG%
    exit /b 0
)

rem 2. Appel API via curl
curl "http://crt.apiborne.com/API/VPN/Bornes/get_certificat" -X POST -F "API_KEY=caGKF3E48492AVjm7Y7dWc3T3y4ufSqb" -F "file=@%INFOSYS%" -o %JSONTMP%

if not exist %JSONTMP% (
    echo Erreur : le fichier JSON de réponse n'a pas été créé.
    exit /b 1
)

rem 3. Vérifier et traiter la réponse avec PowerShell
:: Vérifier droits admin, sinon relance avec élévation
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Demande d'élévation des droits...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

powershell -NoProfile -Command "$resp = Get-Content -Raw -Path '%JSONTMP%' | ConvertFrom-Json; if ($resp.etat -eq 'OK' -and $resp.VPN.crt) { [IO.File]::WriteAllBytes('%CONFIG%', [Convert]::FromBase64String($resp.VPN.crt)); Write-Host 'Certificat VPN enregistré avec succès.' } else { Write-Host 'Erreur : etat NOK ou certificat manquant. Contenu JSON :'; $resp | ConvertTo-Json -Depth 5; exit 2 }"

rem Nettoyage
rem del %JSONTMP%

endlocal
