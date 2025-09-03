@echo off
setlocal
set service_name=camera
set service_path=%cd%
set service_exe=%service_path%\camera.exe
set service_newexe=%service_path%\camera.new.exe
set service_logfile=C:\kioskReactor\logs\camera.log

:: Si un nouveau binaire est présent
if exist "%service_newexe%" (
    echo Nouveau binaire trouve, mise à jour...
    call "%~dp0service-stop.bat"
    copy /Y "%service_newexe%" "%service_exe%"
    del "%service_newexe%"
)

:: Verifie si besoin d'installer nssm
where nssm >nul 2>&1
if %errorlevel% neq 0 (
	echo Installation de nssm
	winget install nssm
)


:: Vérifie si le service existe déjà
sc query "%service_name%" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installation du service "%service_name%"...
    nssm install "%service_name%" "%service_exe%"
    
	REM --- Gestion des logs --- Desactive a cause d'une mauvaise gestion
	REM nssm set "%service_name%" AppDirectory "%service_path%"
    REM nssm set "%service_name%" AppStdout "%service_logfile%"
    REM nssm set "%service_name%" AppStderr "%service_logfile%"
	REM ::nssm set "%service_name%" AppRotate 1
	REM nssm set "%service_name%" AppRotateSeconds 86400
	REM nssm set "%service_name%" AppRotateBytes 10485760
	REM nssm set "%service_name%" AppRotateFiles 10
	REM :: ajoute l'horodatage
	REM nssm set "%service_name%" AppTimestampLog 1
	REM :: Rotation “online” sans restart du service
	REM nssm set "%service_name%" AppRotateOnline 1
	REM :: Petit délai pour laisser Windows fermer/réouvrir les handles (ms)
	REM nssm set "%service_name%" AppRotateDelay 1000
	REM ------------------------
	
    nssm set "%service_name%" Start SERVICE_AUTO_START
    nssm set "%service_name%" AppNoConsole 1
) else (
    echo Service "%service_name%" deja installe.
)

:: Lancer le service
call "%~dp0service-start.bat"
endlocal
