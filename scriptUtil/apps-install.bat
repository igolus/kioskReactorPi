@echo OFF

REM --------------------------------------------------------
REM --- Ce script sera execute a la fin de chaque update ---
REM --------------------------------------------------------


REM Procede a tous les service-install.bat pour chaque projet
REM ---------------------------------------------------------
cd _install
echo install_vnc
call install_vnc.bat > install_vnc.log 2>&1
echo install_openvpn
call install_openvpn.bat > install_openvpn.log 2>&1
echo install_apps
call installApps_noupdate.bat > installApps_noupdate.bat.log 2>&1

cd ..

