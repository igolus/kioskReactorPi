@echo off
setlocal

:: Test la presence de openvpn
where openvpn >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] OpenVPN est dans le PATH.
    goto DL_CERT
)


:: Chemin de téléchargement temporaire
set "OVPN_URL=https://swupdate.openvpn.org/community/releases/OpenVPN-2.6.14-I001-amd64.msi"
set "OVPN_MSI=%TEMP%\OpenVPN-2.6.14-I001-amd64.msi"

echo === TELECHARGEMENT D'OPENVPN ===
powershell -Command "Invoke-WebRequest -Uri '%OVPN_URL%' -OutFile '%OVPN_MSI%'"
if not exist "%OVPN_MSI%" (
    echo [ERREUR] Telechargement echoue.
    exit /b 1
)

echo === INSTALLATION D'OPENVPN POUR TOUS LES UTILISATEURS ===
msiexec /i "%OVPN_MSI%" ALLUSERS=1 /qn
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation.
    exit /b 1
)
setx /M PATH "%PATH%;C:\Program Files\OpenVPN\bin"

echo === VERIFICATION DE L'INSTALLATION ===
timeout /t 2 /nobreak >nul
where openvpn >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] OpenVPN n'est pas dans le PATH.
    exit /b 1
)
openvpn --version

:DL_CERT
echo === TELECHARGEMENT DU CERTIFICAT DE CONNEXION ===
openvpn_cert.bat
set "OVPN_DEST=C:\Program Files\OpenVPN\config\APIBORNE.ovpn"
if exist "%OVPN_DEST%" (
	rem start "" "openvpn" --config "%OVPN_DEST%"
	openvpn-gui --connect "APIBORNE.ovpn" --silent_connection 1 &
)


echo === POSITIONNE LE RESEAU EN PRIVATE ===
timeout /t 5 /nobreak >nul


echo === POSITIONNE LE RESEAU EN PRIVATE ===
timeout /t 5 /nobreak >nul

:: Trouver dynamiquement le nom du profil contenant 'OpenVPN'
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-NetConnectionProfile | Where-Object { $_.Name -like '*OpenVPN*' } | Select-Object -ExpandProperty Name"`) do (
    set "VPN_PROFILE_NAME=%%i"
)

:: Appliquer la modification si un profil correspondant est trouvé
if defined VPN_PROFILE_NAME (
    echo [INFO] Changement de "%VPN_PROFILE_NAME%" en réseau privé...
    powershell -Command "Set-NetConnectionProfile -Name '%VPN_PROFILE_NAME%' -NetworkCategory Private"
) else (
    echo [WARN] Aucun profil réseau contenant 'OpenVPN' trouvé.
)

:: Afficher les profils réseau pour vérification
powershell -Command "Get-NetConnectionProfile"

@REM powershell -Command "Get-NetConnectionProfile"
@REM powershell -Command "Set-NetConnectionProfile -Name 'OpenVPN TAP-Windows6' -NetworkCategory Private"
@REM powershell -Command "Set-NetConnectionProfile -Name 'OpenVPN Data Channel Offload' -NetworkCategory Private"
@REM powershell -Command "Set-NetConnectionProfile -Name 'Réseau 3' -NetworkCategory Private"



@REM powershell -Command "Get-NetConnectionProfile"


echo === INSTALLATION TERMINEE AVEC SUCCES ===

endlocal
