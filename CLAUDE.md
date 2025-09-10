# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the kioskReactorPi project - a Raspberry Pi-based kiosk system that connects to the Kiosk Reactor platform (kioskreactor.com). The system manages kiosk displays, handles remote commands, processes QR codes, controls hardware peripherals, and provides various utility services.

## Architecture

The system is built with a multi-service architecture combining Node.js backend services and Python utilities:

### Core Services (Node.js)
- **Command Listener**: `programs/jsScripts/commandsListener/commandLauncher.js` - Main service that processes remote commands from Firebase
- **WebSocket Server**: `programs/jsScripts/webSocket/wsServer.js` - Handles real-time communication
- **Server Services**: `programs/jsScripts/serverService/services.js` - General service management
- **Life Check**: `programs/jsScripts/lifeCheck/lifeCheckRunner.js` - System health monitoring

### Utility Services (Python)
- **USB Serial Reader**: `programs/PyScripts/usb-serial-reader.py` - Handles serial device communication
- **Screenshot Service**: `programs/PyScripts/takeASnap.py` - Captures screen snapshots
- **Audio Service**: `programs/PyScripts/playSound.py` - Manages sound playback
- **Inactivity Monitor**: `programs/PyScripts/inactivityMouseCheck.py` - Tracks user inactivity

### Key Directories
- `programs/jsScripts/` - Main Node.js application code
- `programs/PyScripts/` - Python utility scripts
- `conf/` - Configuration files (device-specific config.json)
- `ansibleTasks/` - Deployment automation scripts
- `logs/` - Application logs

## Common Development Commands

### Dependencies Management
```bash
# Install Node.js dependencies
cd programs/jsScripts && npm install

# Install Python dependencies  
cd programs/PyScripts && pip install -r requirements.txt
```

### System Launch Commands
```bash
# Launch full system (Linux/Pi)
./launchSystem.sh

# Launch lite version
./launchSystemLite.sh

# Launch Windows version
./launchSystemWin.sh

# Kill all services
./killSystem.sh
```

### Development Utilities
```bash
# Update system
./update.sh        # Linux/Pi
./update.bat       # Windows

# Chrome debugging (when running)
# Access: http://localhost:9222/json
```

## Key Configuration Files

- `conf/config.json` - Device configuration (deviceId, URLs, etc.)
- `local.yml` - Ansible deployment configuration
- `version.json` - Current system version
- `programs/jsScripts/package.json` - Node.js dependencies

## Database Integration

The system uses Firebase/Firestore for:
- Device management (`programs/jsScripts/dbUtil/deviceUtil.js`)
- Event logging (`programs/jsScripts/dbUtil/eventsUtil.js`) 
- Brand/project data (`programs/jsScripts/dbUtil/brandUtil.js`)
- Version tracking (`programs/jsScripts/dbUtil/versionUtil.js`)

## Hardware Integration

- **Thermal Printers**: Managed via `node-thermal-printer` package
- **Serial Devices**: Python scripts handle USB serial communication
- **Relay Controls**: Electronic relay management in `programs/jsScripts/elec/`
- **Camera/Snapshots**: Python-based screenshot capture

## Multi-Platform Support

The codebase supports:
- **Raspberry Pi** (primary target): Uses Linux-specific commands and GPIO
- **Windows**: Alternative launch scripts and utilities
- **Cross-platform**: Node.js services work across platforms

## Remote Command System

Commands are received via Firebase and processed through:
1. `commandLauncher.js` - Main command dispatcher
2. WebSocket communication for real-time updates
3. Chrome DevTools Protocol for browser control
4. System-level script execution

## Testing

No formal test suite is configured. Testing is typically done through:
- Manual system integration testing
- Remote command verification via Firebase
- Hardware peripheral testing on actual devices