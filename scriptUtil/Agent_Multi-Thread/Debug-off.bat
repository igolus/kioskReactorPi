@echo off
setlocal enabledelayedexpansion

echo [INFO] --- DEBUG OFF : Désactive le remote debugging et retire le flag ---

REM 1. Trouver l'IP VPN (même logique que debug-on)
FOR /F "tokens=2 delims=:" %%A IN ('ipconfig ^| findstr /R /C:"IPv4.*10\.10\."') DO (
    SET IP_VPN=%%A
)
IF "%IP_VPN%"=="" (
    echo [INFO] Aucune IP 10.10.x.x détectée, suppression forcée.
) ELSE (
    SET IP_VPN=%IP_VPN: =%
    REM 2. Supprimer la redirection netsh
    netsh interface portproxy delete v4tov4 listenaddress=%IP_VPN% listenport=9222
)

echo [OK] Remote debugging désactivé

REM 3. Supprimer le fichier de flag
if exist "C:\mode-debug-actif" del "C:\mode-debug-actif"

echo [OK] fichier flag supprime.

REM 4. Execute les fichier "debug-mode-off.bat" de chaque application
SET repertoire_cible="c:\kioskReactor\scriptUtil"
REM Parcourir tous les sous-dossiers
for /d %%D in ("%repertoire_cible%\*") do (
    REM Vérifier si debug-mode-off.bat existe dans ce dossier
    if exist "%%D\debug-mode-off.bat" (
        echo  Execution de "%%D\debug-mode-off.bat"...
        cd "%repertoire_cible%\%%D\"
        call "%%D\debug-mode-off.bat"
        
        REM Vérifier le code de retour
        if !errorlevel! equ 0 (
            echo [OK] Execution "%%D\debug-mode-off.bat" reussie
        ) else (
            echo [ERREUR] Execution "%%D\debug-mode-off.bat" echouee - Code retour: !errorlevel!
        )
    )
    echo.
)

echo ============================================
echo Traitement termine
echo ============================================