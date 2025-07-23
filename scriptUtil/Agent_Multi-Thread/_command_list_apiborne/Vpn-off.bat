@echo off
echo "Stop vpn"
openvpn-gui --command disconnect "APIBORNE.ovpn" --show_script_window 0 --show_balloon 0 --silent_connection 1
openvpn-gui --command disconnect_all --show_script_window 0 --show_balloon 0 --silent_connection 1
