@echo off

REM Stoppe le service si le programme tourne en tant que service
call .\service-stop.bat
REM Tue tous les processus nommés camera.exe (Windows uniquement)
taskkill /F /IM camera.exe
