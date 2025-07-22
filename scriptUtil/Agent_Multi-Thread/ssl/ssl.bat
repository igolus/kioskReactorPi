@echo off
setlocal

echo ===============================
echo INSTALLATION DE MKCERT
echo ===============================

REM Vérifie si mkcert est installé
where mkcert >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] mkcert non trouve, installation via winget...
    winget install --id=FiloSottile.mkcert -e --source winget
) ELSE (
    echo [INFO] mkcert deja installe
)
echo.
echo ===============================
echo INSTALLATION DE L'AUTORITE LOCALE
echo ===============================
mkcert -install

echo.
echo ===============================
echo GENERATION DU CERTIFICAT
echo ===============================
mkcert localhost 127.0.0.1 "*.local.apiborne.com" ::1


:found_cert
echo.
echo ===============================
echo CERTIFICAT DISPONIBLE
echo ===============================
echo - ssl\key.pem
REM Renomme les fichiers
for /f %%K in ('dir /b "localhost+*-key.pem"') do (
    move "%%K" "key.pem" >nul
)
echo - ssl\cert.pem
for /f %%K in ('dir /b "localhost+*.pem"') do (
    move "%%K" "cert.pem" >nul
)


echo.

pause
