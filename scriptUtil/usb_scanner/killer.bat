@echo off

REM Stoppe le service si le programme tourne en tant que service
call .\service-stop.bat
REM Tue tous les processus nommés Agent-mt.exe (Windows uniquement)
taskkill /F /IM usb_scanner.exe
