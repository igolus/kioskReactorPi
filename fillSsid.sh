#!/bin/bash
ssid=$1
pass=$2

fileName="/etc/wpa_supplicant/wpa_supplicant.conf"
tempFile="/home/pi/temp_wpa_supplicant.conf"

buildConf () {
  echo "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev" > $fileName
  echo "update_config=1" >> $fileName
  echo "country=GB" >> $fileName
  echo "network={" >> $fileName
  echo -e "\tssid=\"${ssid}\"" >> $fileName
  echo -e "\tpsk=\"${pass}\"" >> $fileName
  echo "}" >> $fileName
  echo "" >> $fileName
}

buildConf
sudo systemctl daemon-reload
sudo systemctl restart dhcpcd
#sudo wpa_cli -i wlan0 reconfigure
