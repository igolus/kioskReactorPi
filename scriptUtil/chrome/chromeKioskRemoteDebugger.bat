@echo on
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

:: Libere tous les proxy pour être sur qu'aucun ne va bloquer le demarrage de chrome
c:\windows\system32\netsh interface portproxy reset

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
 --remote-debugging-address=127.0.0.1 ^
 --user-data-dir="%USER_DATA_DIR%" ^
 --allow-file-access-from-files ^
 --disk-cache-dir=null ^
 "%URL%"

