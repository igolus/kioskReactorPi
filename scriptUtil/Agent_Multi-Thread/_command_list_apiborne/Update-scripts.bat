@echo off
set SERVER=10.10.10.2
set SHARE=\\%SERVER%\Bornes
set SRC=%SHARE%\apiborne
set DEST=c:\kioskReactor\scriptUtil
set USER=borne
set PASS=borne

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
echo Copie des fichiers serveur vers local...
echo ------------------------------
robocopy "%SRC%" "%DEST%" *.* /E /DCOPY:DA /COPY:DAT /IS /IT /R:2 /W:2 /J /NP
REM  /FFT /Z /R:2 /W:2
echo.
echo --------
echo Terminé.
echo --------


