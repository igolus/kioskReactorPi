@echo off
setlocal
set service_name=Agent-mt

sc query "%service_name%" | find "RUNNING" >nul
if %errorlevel%==0 (
    echo Arret du service "%service_name%"...
    sc stop "%service_name%"
    timeout /t 5 >nul
	sc query %service_name% | find "STATE" | find "STOPPED" >nul
	if errorlevel 1 (
		taskkill /F /IM nssm.exe /FI "SERVICES eq %service_name%"
	)
	
) else (
    echo Service "%service_name%" deja arrete ou absent.
)
endlocal
