@echo off

REM Demmarrage de l'Agent-mt de surveillance
REM      -minimize     => Demmarrage  minimisé
REM      -config ...   => Fichier de configuration
start Agent-mt.exe -minimize -config "configuration.json"