@echo off
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh

REM Installation des services pour demarrage automatique avec Windows
call c:\kioskReactorPi\scriptUtil\Agent_Multi-Thread\service-install.bat
call c:\kioskReactorPi\scriptUtil\Camera\service-install.bat
