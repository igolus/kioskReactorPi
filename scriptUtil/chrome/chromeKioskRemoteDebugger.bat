@echo off
if "%1"=="" (
    echo Usage: ChromeRemoteDebugger.bat [URL]
    exit /b 1
)

set URL=%1

netsh interface portproxy delete v4tov4 listenport=9222 listenaddress=0.0.0.0
start /b cmd /c call "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --disable-web-security --allow-running-insecure-content --disable-features=IsolateOrigins,SitePerProcess,TouchpadOverscrollHistoryNavigation,TranslateUI --use-fake-ui-for-media-stream --disable-session-crashed-bubble --no-first-run --fast --fast-start --password-store=basic --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 --user-data-dir=dev-mode-removeme --disk-cache-dir=null %URL%
timeout 5
netsh interface portproxy add v4tov4 listenport=9222 connectaddress=127.0.0.1 connectport=9222 listenaddress=0.0.0.0
cls
echo ============================================
echo  Chrome started with following configuration:
echo ============================================
echo    * Kiosk Mode
echo    * No-Caching
echo    * Developer Profile
echo    * Disabled TouchHistory
echo    * Disabled Web-Security
echo    * Allowed XHR Localfile Access
echo    * Forwarded Remote-Debug Port
echo ============================================
ipconfig | findstr "IPv4"
echo    Remote-Debug Port: 9222
echo ============================================
echo Dont close Chrome manually
echo Press any Button to terminate Chrome Network Debug Session
echo ============================================