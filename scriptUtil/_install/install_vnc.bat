@echo off
setlocal

echo === Installation de TightVNC Server...
powershell -Command "Invoke-WebRequest -Uri https://www.tightvnc.com/download/2.8.81/tightvnc-2.8.81-gpl-setup-64bit.msi -OutFile tightvnc.msi"
msiexec /i tightvnc.msi /quiet /norestart ADDLOCAL="Server" SET_USEVNCAUTHENTICATION=1 SET_PASSWORD=apiborne SET_VIEWONLYPASSWORD=12345678 


echo ➤ Mot de passe VNC port : 5900
echo ➤ Mot de passe VNC viewer : 12345678
endlocal
