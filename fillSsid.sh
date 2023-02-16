#!/bin/bash
ssid=$1
pass=$2
#/etc/wpa_supplicant/wpa_supplicant.conf

fileName="/etc/wpa_supplicant/wpa_supplicant.conf"
tempFile="/home/pi/temp_wpa_supplicant.conf"
echo "" > $tempFile

appendNew () {
  echo "" >>   $tempFile
  echo "#KIOSK" >> $tempFile
  echo "network={" >> $tempFile
  echo "  ssid=\"${ssid}\"" >> $tempFile
  echo "  psk=\"${pass}\"" >> $tempFile
  echo "}" >> $tempFile
  echo "#ENDKIOSK" >> $tempFile
}

deleteBlock() {
  echo "${lineStart},${lineEnd}d ${fileName}"
  sed -e ${lineStart},${lineEnd}d $fileName > $tempFile
}


lineStart=`grep -n "#KIOSK" testFile.conf | head -n 1 | cut -d: -f1`
if [ -z $lineStart ]
then
  lineStart=0
fi

lineEnd=`grep -n "#ENDKIOSK" testFile.conf | head -n 1 | cut -d: -f1`
if [ -z $lineEnd ]
then
  lineEnd=0
fi

echo $lineStart
echo $lineEnd

if [[ $lineStart -eq 0 ]]
then
  echo "append new"
  cat $fileName > $tempFile

  appendNew
else
  echo "append exist"
  deleteBlock
  appendNew

fi

sed -i '/^$/d' $tempFile
cp $tempFile $fileName

#network={
#        ssid="Livebox-49D8"
#        psk="tfMP5cwmTNTHRfTonD"
#}
