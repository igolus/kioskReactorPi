# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

kioskReactorPi is a Raspberry Pi-based kiosk management system that connects devices to the Kiosk Reactor platform (kioskreactor.com). The system provides remote command execution, hardware control, browser automation via Chrome DevTools Protocol, and real-time communication through WebSocket and Firebase.

## Architecture

### Multi-Service Event-Driven System

The system uses a distributed architecture where services communicate via:
- **WebSocket Server** (port 8080): Central message broker for local communication
- **Firebase/Firestore**: Remote command queue and device state management
- **Chrome DevTools Protocol** (port 9222): Browser automation for kiosk display control

### Core Services (Node.js)

**Command Launcher** (`programs/jsScripts/commandsListener/commandLauncher.js`)
- Main command processor and system orchestrator
- Connects to Chrome via WebSocket (CDP) for browser automation
- Listens to Firebase for remote commands and dispatches to appropriate handlers
- Key functions: `chromeNavigate()`, `onEvent()`, `updateDevice()`, `rebootDevice()`
- Runs in two modes: `lite` (no Chrome) or full mode (with Chrome automation)

**WebSocket Server** (`programs/jsScripts/webSocket/wsServer.js`)
- Central communication hub running on port 8080
- Broadcasts messages to all connected clients
- Listens to Firebase events/commands via `listenToEvents()` and `listenToCommands()`
- Validates messages with `checkData()` before broadcasting
- Triggers external webhooks when configured in project settings

**Server Services** (`programs/jsScripts/serverService/services.js`)
- General service management and coordination

**Life Check** (`programs/jsScripts/lifeCheck/lifeCheckRunner.js`)
- System health monitoring and heartbeat reporting

### Utility Services (Python)

- `usb-serial-reader.py` - Serial device communication (COM ports)
- `takeASnap.py` - Screenshot capture service
- `playSound.py` - Audio playback management
- `inactivityMouseCheck.py` - User activity monitoring

### Command Processing Flow

1. Command arrives via Firebase → `wsServer.js` receives via `listenToCommands()`
2. WebSocket broadcasts command to all local clients
3. `commandLauncher.js` receives command via WebSocket connection
4. Command parsed by action utilities (`actionUtil.js`)
5. Appropriate handler executed (e.g., `chromeNavigate()`, `printTicket()`, `rebootDevice()`)
6. Results sent back through WebSocket/Firebase

### Database Layer

All Firebase/Firestore operations in `programs/jsScripts/dbUtil/`:
- `deviceUtil.js` - Device CRUD operations, `getCurrentDevice()` used by all services
- `projectUtil.js` - Project/brand configuration retrieval
- `eventsUtil.js` - Event logging and Firebase listeners
- `versionUtil.js` - System version tracking for updates

Each service calls `getCurrentDevice()` and `getCurrentProject()` on startup to load configuration.

## Development Commands

### Installing Dependencies

```bash
# Node.js dependencies
cd programs/jsScripts && npm install

# Python dependencies (if using Python services)
cd programs/PyScripts && pip install -r requirements.txt
```

### Running the System

**Linux/Raspberry Pi:**
```bash
./launchSystem.sh        # Full system with all services
./launchSystemLite.sh    # Lite mode without Chrome
./killSystem.sh          # Stop all services
./killSystemNoChrome.sh  # Stop services but keep Chrome running
```

**Windows (via Cygwin):**
```bash
./launchSystemWin.sh     # Full Windows system
./killSystemWin.sh       # Stop Windows services
```

**Individual Services (for debugging):**
```bash
cd programs/jsScripts/commandsListener && node commandLauncher.js
cd programs/jsScripts/webSocket && node wsServer.js
cd programs/jsScripts/lifeCheck && node lifeCheckRunner.js
cd programs/jsScripts/serverService && node services.js
```

### System Updates

```bash
./update.sh    # Linux/Pi: Runs ansible-pull to update system
./update.bat   # Windows: Runs update script via Cygwin
```

### Chrome Debugging

When system is running, Chrome DevTools Protocol is exposed on:
- URL: `http://localhost:9222/json` (Windows) or `http://127.0.0.1:9222/json` (Linux)
- Lists all tabs with WebSocket URLs for debugging
- `commandLauncher.js` connects to first tab's WebSocket to control browser

## Configuration

### Main Config File: `conf/config.json`

```json
{
  "urlWsLocal": "ws://localhost:8080",
  "windows": "true",           // Platform flag: "true" or "false"
  "comPort": "COM3",           // Serial port for USB devices
  "deviceId": "qnpHL1Qm4"      // Unique device identifier for Firebase
}
```

All services read this file to:
- Determine platform-specific behavior (`conf.windows`)
- Get device ID for Firebase operations (`config.deviceId`)
- Connect to local WebSocket (`config.urlWsLocal`)

### Version Tracking: `version.json`

Current system version in format `YY.MM.DD`. Updated during system updates.

## Platform Differences

The codebase handles cross-platform differences in:

**Command Execution** (`commandLauncher.js`):
- Windows: Uses `c:\\cygwin64\\bin\\bash.exe` for scripts, `shutdown /r` for reboot
- Linux: Uses `sudo` commands, `sudo reboot` for reboot
- Check: `if (conf.windows)` throughout codebase

**File Paths**:
- Windows scripts use Cygwin paths: `/cygdrive/c/kioskReactor/`
- Linux scripts use native paths: `/home/pi/kioskReactor/`

**Launch Scripts**:
- Linux: Services run with `sudo` for hardware access
- Windows: Services run under Cygwin bash environment

## Remote Command System

### Command Types (in `webSocket/commandTypes.js`)

Commands received from Firebase:
- `commandTypeOpenUrl` - Navigate Chrome to URL
- `commandTypeReboot` - Reboot device
- `commandTypeUpdate` - Update system via ansible/update script
- `commandTypePrintTicket` - Print thermal receipt
- `commandTypeSpeak` - Text-to-speech output
- `commandTypeSnap` - Capture screenshot
- `commandTypeNGrok` - Start/stop ngrok tunnel
- `commandTypeOpenRelay`/`commandTypeCloseRelay` - Hardware relay control

### Event Types (in `webSocket/eventTypes.js`)

Events sent to Firebase:
- `eventTypeQrCode` - QR code scanned
- `eventTypeSnapReady` - Screenshot captured and uploaded
- `eventTypeInactivity` - User inactivity detected
- `eventTypePaymentDone` - Payment completed

### Message Validation

All WebSocket messages validated by `checkData()` in `wsServer.js`:
- Must have either `commandType` + `commandParam` OR `eventType` + `eventValue`
- Types must be strings and match known command/event types
- Invalid messages are rejected with logged errors

## Hardware Integration

### Thermal Printers

Printing handled via `node-thermal-printer` package in `commandsListener/printUtil.js`:
- Supports network printers (via IP) and USB printers
- Can print to specific IPs: `printTicketTargetIp(ticketWithIpTarget)`
- Uses device configuration: `device.localPrinterIp`

### Serial Devices

Python script `usb-serial-reader.py` handles USB serial communication:
- Reads from COM port specified in `config.json`
- Sends data to WebSocket server for processing

### Electronic Relays

Relay control in `programs/jsScripts/elec/relay.js`:
- Functions: `turnRelayOn()`, `turnRelayOff()`
- Platform-specific GPIO access on Raspberry Pi

## Logging

Winston-based logging throughout codebase (`util/loggerUtil.js`):
- Daily rotating log files in `logs/` directory
- Log format: `log-YYYY-MM-DD.log`
- Windows launch script auto-cleans logs older than 5 days
- Each service has its own logger: `loggerCommand`, `loggerWs`, etc.

## Testing

No automated test suite. Testing approach:
- Manual integration testing with actual hardware
- Remote command testing via Firebase console
- Chrome DevTools inspection at `localhost:9222`
- Log file analysis in `logs/` directory

## Working with the Codebase

### Adding a New Command

1. Add command type constant in `webSocket/commandTypes.js`
2. Add to `allCommands` array in `wsServer.js`
3. Create getter function in `webSocket/actionUtil.js` (e.g., `getMyCommand()`)
4. Add handler in `commandLauncher.js` `onEvent()` function
5. Implement handler function (e.g., `executeMyCommand()`)

### Adding a New Event

1. Add event type constant in `webSocket/eventTypes.js`
2. Add to `allEvents` array in `wsServer.js`
3. Trigger event by sending JSON via WebSocket to localhost:8080
4. Event will be broadcast to all clients and logged to Firebase

### Debugging Connection Issues

1. Check WebSocket server: `netstat -an | grep 8080`
2. Verify Chrome CDP: `curl http://localhost:9222/json`
3. Check Firebase connection in logs: `tail -f logs/log-$(date +%F).log`
4. Verify device ID in `conf/config.json` matches Firebase

### Service Startup Order

The launch scripts start services in this order:
1. Life Check (health monitoring)
2. WebSocket Server (communication hub)
3. Server Services (if needed)
4. Command Launcher (main orchestrator)
5. Python utilities (USB reader, snapshots, sound, inactivity)

Command Launcher waits for Chrome to be available before initializing (polls `localhost:9222/json`).
