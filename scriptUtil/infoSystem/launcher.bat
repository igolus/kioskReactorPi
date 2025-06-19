@echo off
pip install -r requirements.txt --no-warn-script-location --break-system-packages
python main.py %*