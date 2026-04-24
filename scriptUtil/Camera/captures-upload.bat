@echo off
set SERVER=10.10.10.2
set SHARE=\\%SERVER%\Bornes
set SRC=c:\kioskReactor\scriptUtil\Camera\captures\
set DEST=%SHARE%\_UPLOAD\
set USER=borne
set PASS=borne

REM Paramètre dynamique
set PARAM1=%1

echo ------------------------------
echo Verification PARAM1
echo ------------------------------
if "%PARAM1%"=="" (
    echo.
    echo [ERREUR] Vous devez renseigner un identifiant de borne.
    echo Exemple : captures-upload.bat 001
    exit /b 1
)


echo -----------------------------
echo Verification connexion VPN...
echo -----------------------------
ping -n 1 %SERVER% >nul
if errorlevel 1 (
    echo Serveur injoignable. VPN probablement coupe.
    exit /b
)

echo. 
echo ------------------------------
echo Connexion au partage reseau...
echo ------------------------------
net use %SHARE% /user:%USER% %PASS%
if errorlevel 1 (
    echo Echec connexion partage SMB.
    exit /b
)

echo.
echo ------------------------------
echo Creation du dossier distant...
echo ------------------------------
set DEST=%DEST%\apiborne%PARAM1%\captures\
if not exist "%DEST%" (
    echo "%DEST%"
    mkdir "%DEST%"
)

echo.
echo ------------------------------
echo Copie des fichiers serveur vers local...
echo ------------------------------
robocopy %SRC% %DEST% *.* /E /DCOPY:DA /COPY:DAT /IS /IT /R:2 /W:2 /J /NP
REM  /FFT /Z /R:2 /W:2
echo.
echo --------
echo Termine.
echo --------

endlocal
