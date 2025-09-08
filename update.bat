@echo off
call c:\cygwin64\bin\bash.exe C:\kioskReactor\update.sh

REM Installation des services pour demarrage automatique avec Windows
cd c:\kioskReactorPi\scriptUtil\Agent_Multi-Thread\
call c:\kioskReactorPi\scriptUtil\Agent_Multi-Thread\service-install.bat
cd c:\kioskReactorPi\scriptUtil\Camera\
call c:\kioskReactorPi\scriptUtil\Camera\service-install.bat
