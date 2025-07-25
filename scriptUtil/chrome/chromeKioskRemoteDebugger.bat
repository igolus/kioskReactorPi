@echo off
setlocal

:: Vérifie qu'un paramètre URL est passé
if "%1"=="" (
    echo Usage: ChromeRemoteDebugger.bat [URL]
    exit /b 1
)

set "URL=%1"
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "USER_DATA_DIR=%TEMP%\dev-mode-removeme"
set "REMOTE_PORT=9222"

:: Nettoie un ancien profil Chrome s'il existe
if exist "%USER_DATA_DIR%" (
    echo Suppression du profil utilisateur temporaire...
    rmdir /s /q "%USER_DATA_DIR%"
)

:: Vérifie que Chrome existe
if not exist "%CHROME_PATH%" (
    echo Chrome non trouve a l'emplacement : %CHROME_PATH%
    exit /b 2
)


netsh interface portproxy delete v4tov4 listenport=9222 listenaddress=0.0.0.0

cls
:: Lancer Chrome en mode debug
start "" "%CHROME_PATH%" ^
 --kiosk ^
 --disable-web-security ^
 --allow-running-insecure-content ^
 --disable-features=IsolateOrigins,SitePerProcess,TouchpadOverscrollHistoryNavigation,TranslateUI ^
 --use-fake-ui-for-media-stream ^
 --disable-session-crashed-bubble ^
 --no-first-run ^
 --fast ^
 --fast-start ^
 --password-store=basic ^
 --noerrdialogs ^
 --incognito ^
 --disable-pinch ^
 --overscroll-history-navigation=0 ^
 --disable-infobars ^
 --remote-debugging-port=%REMOTE_PORT% ^
 --remote-debugging-address=0.0.0.0 ^
 --user-data-dir="%USER_DATA_DIR%" ^
 --allow-file-access-from-files ^
 --disk-cache-dir=null ^
 "%URL%"

:: Attente de quelques secondes pour que Chrome ouvre le port
echo.
echo Attente de l'initialisation de Chrome...
timeout /t 15 /nobreak > nul
netsh interface portproxy add v4tov4 listenport=9222 connectaddress=127.0.0.1 connectport=9222 listenaddress=0.0.0.0

:: Vérifie si le port est bien ouvert
echo.
echo Vérification que le port %REMOTE_PORT% est actif...
netstat -ano | findstr ":%REMOTE_PORT%" > nul
if errorlevel 1 (
    echo.
    echo ERREUR : Chrome n'a pas ouvert le port %REMOTE_PORT%. Debug impossible.
    echo Vérifiez si un pare-feu ou un antivirus bloque l'ouverture du port.
    exit /b 3
)

cls
echo ============================================
echo  Chrome started with following configuration:
echo ============================================
echo    * Kiosk Mode
echo    * No-Caching
echo    * Developer Profile (temporaire)
echo    * Disabled TouchHistory
echo    * Disabled Web-Security
echo    * Allowed XHR Localfile Access
echo    * Remote-Debug Port : %REMOTE_PORT%
echo ============================================
ipconfig | findstr "IPv4"
echo ============================================
echo Accedez a : http://localhost:%REMOTE_PORT%/json
echo ou depuis un autre PC : http://IP_DE_CET_ORDINATEUR:%REMOTE_PORT%/json
echo.

