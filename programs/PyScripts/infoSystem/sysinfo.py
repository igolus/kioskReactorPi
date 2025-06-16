import platform
import socket
import psutil
import json
import datetime
import os
import subprocess

def get_network_info():
    net_info = {}
    addrs = psutil.net_if_addrs()
    for iface_name, iface_addrs in addrs.items():
        for addr in iface_addrs:
            if addr.family == socket.AF_INET:
                net_info[iface_name] = {
                    "ip_address": addr.address,
                    "netmask": addr.netmask,
                    "broadcast": addr.broadcast
                }
    return net_info

def get_default_gateway():
    try:
        result = subprocess.run(["ip", "route"], capture_output=True, text=True)
        for line in result.stdout.splitlines():
            if line.startswith("default"):
                return line.split()[2]
    except Exception:
        return None

def get_dns_servers():
    dns_servers = []
    try:
        with open('/etc/resolv.conf', 'r') as f:
            for line in f:
                if line.startswith('nameserver'):
                    dns_servers.append(line.strip().split()[1])
    except Exception:
        dns_servers.append("Erreur lors de la lecture du fichier resolv.conf")
    return dns_servers

def get_uptime():
    boot_time_timestamp = psutil.boot_time()
    boot_time = datetime.datetime.fromtimestamp(boot_time_timestamp)
    return boot_time.isoformat()

def get_memory_info():
    mem = psutil.virtual_memory()
    return {
        "total": mem.total,
        "available": mem.available,
        "used": mem.used,
        "percent": mem.percent
    }

def get_disk_info():
    disk = psutil.disk_usage('/')
    return {
        "total": disk.total,
        "used": disk.used,
        "free": disk.free,
        "percent": disk.percent
    }

def get_usb_devices():
    usb_devices = []
    try:
        if platform.system() == "Linux":
            result = subprocess.run(["lsusb"], capture_output=True, text=True)
            usb_devices = result.stdout.strip().split("\n")
        elif platform.system() == "Windows":
            result = subprocess.run(["powershell", "Get-PnpDevice -PresentOnly | Where-Object { $_.InstanceId -match '^USB' }"], capture_output=True, text=True)
            usb_devices = result.stdout.strip().split("\n")
        elif platform.system() == "Darwin":  # macOS
            result = subprocess.run(["system_profiler", "SPUSBDataType"], capture_output=True, text=True)
            usb_devices = result.stdout.strip().split("\n")
    except Exception as e:
        usb_devices.append(f"Erreur lors de la récupération des périphériques USB: {e}")
    return usb_devices

def collect_system_info(uuid:str):
    system_info = {
        "UUID": str(uuid),
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "platform_release": platform.release(),
        "platform_version": platform.version(),
        "network_interfaces": get_network_info(),
        "default_gateway": get_default_gateway(),
        "dns_servers": get_dns_servers(),
        "boot_time": get_uptime(),
        "memory_info": get_memory_info(),
        "disk_info": get_disk_info(),
        "usb_devices": get_usb_devices()
    }
    return system_info

def write_to_file(data, filename="system_info.json", json=True):
    if json:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
    else:
        with open(filename, 'w') as f:
              f.write(data)



if __name__ == "__main__":
    info = collect_system_info(uuid="5feb8c0-3f1d-4a2e-9b5c-6f7e8d9a0b1c")
    write_to_file(info)
    print("\nInformations système sauvegardées dans 'system_info.json'")
