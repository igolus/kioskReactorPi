@echo off
setlocal enabledelayedexpansion

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

echo [OK] Remote debugging actif sur %IP_VPN%:9222

REM 3. Créer le fichier de flag
echo Debug actif > "C:\mode-debug-actif"

echo [OK] fichier flag cree.


REM 4. Execute les fichier "debug-mode-on.bat" de chaque application
SET repertoire_cible="c:\kioskReactor\scriptUtil"
REM Parcourir tous les sous-dossiers
for /d %%D in ("%repertoire_cible%\*") do (
    REM Vérifier si debug-mode-on.bat existe dans ce dossier
    if exist "%%D\debug-mode-on.bat" (
        echo  Execution de "%%D\debug-mode-on.bat"...
        cd "%repertoire_cible%\%%D\"
        call "%%D\debug-mode-on.bat"
        
        REM Vérifier le code de retour
        if !errorlevel! equ 0 (
            echo   [OK] Execution "%%D\debug-mode-on.bat" reussie
        ) else (
            echo   [ERREUR] Execution "%%D\debug-mode-on.bat" echouee - Code retour: !errorlevel!
        )
    )
    echo.
)

echo ============================================
echo Traitement termine
echo ============================================
