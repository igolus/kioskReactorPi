@echo off
setlocal

cd c:\kioskReactor\scriptUtil\Camera

set "CONFIG_CAM=configuration.json"
if exist "configuration_site.json" (
    set "CONFIG_CAM=configuration_site.json"
)

if exist "%CONFIG_CAM%.bak" (
	copy "%CONFIG_CAM%.bak" "%CONFIG_CAM%"
)

del /F /S ".\captures\*.jpg"

echo [OK] Mode debug de l'app Camera inactif
