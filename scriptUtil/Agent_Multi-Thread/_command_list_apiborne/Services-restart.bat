@echo off
set DEST=c:\kioskReactor\scriptUtil

cd %DEST%\Camera\
call .\service-restart.bat

cd %DEST%\usb_scanner\
call .\service-restart.bat

endlocal
