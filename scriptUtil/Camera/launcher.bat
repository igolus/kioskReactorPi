@echo off
setlocal enabledelayedexpansion

set service_path=%cd%
set service_name=camera.exe
set service_exe=%service_path%\camera.exe
set service_newexe=%service_path%\camera.new.exe
set CUR_MD5=
set NEW_MD5=


REM Si le programme est déja en cours d'éxécution on le stop
tasklist /FI "IMAGENAME eq %service_name%" | find /I "%service_name%" >nul
if %ERRORLEVEL%==0 (
	call "%service_path%\killer.bat"
)

REM Si un nouveau binaire est présent
if exist "%service_newexe%" (
	for /f "usebackq delims=" %%H in (`powershell -command "(Get-FileHash -Algorithm MD5 '%service_exe%').Hash"`)    do set CUR_MD5=%%H
	for /f "usebackq delims=" %%H in (`powershell -command "(Get-FileHash -Algorithm MD5 '%service_newexe%').Hash"`) do set NEW_MD5=%%H
	echo MD5 courant:   !CUR_MD5!
	echo MD5 nouveau:   !NEW_MD5!
	
	if /I "!CUR_MD5!"=="!NEW_MD5!" (
        echo Empreinte identique.
	) else (
		echo Nouveau binaire trouve, mise à jour...
		copy /Y "%service_newexe%" "%service_exe%"
	)
)


REM Demmarrage de Camera
REM      --minimize     => Demmarrage  minimisé
REM      --config ...   => Fichier de configuration

REM === Test de l'existence du fichier de configuration spécifique ===
set "CONFIG=configuration.json"
if exist "configuration_site.json" (
    set "CONFIG=configuration_site.json"
)

call "%service_exe%" --minimize --config "%CONFIG%"
