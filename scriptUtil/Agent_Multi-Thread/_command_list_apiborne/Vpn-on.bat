@echo off
echo "Start the vpn"
openvpn-gui --connect "APIBORNE.ovpn" --show_script_window 0 --show_balloon 0 --silent_connection 1
