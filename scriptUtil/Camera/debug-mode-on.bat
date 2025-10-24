@echo off
setlocal

cd c:\kioskReactor\scriptUtil\Camera

set "CONFIG_CAM=configuration.json"
if exist "configuration_site.json" (
    set "CONFIG_CAM=configuration_site.json"
)

REM 4. Modification à la volé du fichier de config de la CAMERA pour stockage des photos
if not exist "%CONFIG_CAM%.bak" (
	copy "%CONFIG_CAM%" "%CONFIG_CAM%.bak"
)

REM Modification du fichier json via PowerShell
powershell -Command "$json = Get-Content '%CONFIG_CAM%' -Raw | ConvertFrom-Json; $json.camera.capture.filename_pattern = 'capture_{YYYY}{MM}{DD}_{HH}{mm}{SS}.jpg'; $json | ConvertTo-Json -Depth 10 | Set-Content '%CONFIG_CAM%'"

echo [OK] Mode debug de l'app Camera actif
