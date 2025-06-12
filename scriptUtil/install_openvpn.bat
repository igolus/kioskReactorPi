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
set "OVPN_DEST=C:\Program Files\OpenVPN\config\install_openvpn.ovpn"
if not exist "%OVPN_DEST%" (
	powershell -Command "Invoke-WebRequest -Uri 'http://vpn.ron06.fr/install_openvpn.ovpn' -OutFile '%OVPN_DEST%'"
	if not exist "%OVPN_DEST%" (
		echo [ERREUR] Telechargement du certificat d'installation echoue.
		exit /b 1
	)
	start "" "openvpn" --config "%OVPN_DEST%"
)

echo === POSITIONNE LE RESEAU EN PRIVATE ===
timeout /t 5 /nobreak >nul
powershell -Command "Get-NetConnectionProfile"
powershell -Command "Set-NetConnectionProfile -Name 'OpenVPN TAP-Windows6' -NetworkCategory Private"
powershell -Command "Get-NetConnectionProfile"


echo === INSTALLATION TERMINEE AVEC SUCCES ===

endlocal
