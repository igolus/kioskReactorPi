import time

import requests
from tabulate import tabulate
from sysinfo import *

SLEEP_SECONDS = 60
UUID="LuYc5IXn3"
# URL = "http://213.165.82.31/borne.php"


def upload_json(url, data, json_filename="temp.json", text_file="temp.txt"):
    """
    Envoie un objet Python (data) sous forme de fichier JSON à la page borne.php
    Retourne le résultat JSON retourné par le serveur.
    """
    # 1. Écrire le JSON dans un fichier temporaire
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 2. Préparer le fichier à envoyer
    with open(json_filename, "rb") as file_obj:
        files = {'jsonfile': (json_filename, file_obj, 'application/json')}
        response = requests.post(url, files=files)
    # 3. Supprimer le fichier temporaire
    if os.path.exists(json_filename):
        os.remove(json_filename)
    
    # 4. Retourner la réponse JSON
    try:
        return response.json()
    except Exception:
        return {"error": "Erreur de décodage JSON", "raw_response": response.text}


def print_table_and_write(data, printToConsole=True):
    table = []
    table.append(["Clé", "Valeur"])
    for key, value in data.items():
        if isinstance(value, dict):
            for subkey, subval in value.items():
                table.append([f"{key}.{subkey}", subval])
        elif isinstance(value, list):
            joined = "\n".join(value) if key == "usb_devices" else ", ".join(value)
            table.append([key, joined])
        else:
            table.append([key, value])
    if printToConsole:
        print(tabulate(table, headers="firstrow", tablefmt="grid"))
    write_to_file(tabulate(table, headers="firstrow", tablefmt="grid"), filename="system_info.txt", jsonType=False)

if __name__ == "__main__":
    while True:
        info = collect_system_info(uuid=UUID)
        write_to_file(info)
        print_table_and_write(info, printToConsole=False)

        print(f"En attente pendant {SLEEP_SECONDS} secondes...\n")
        time.sleep(SLEEP_SECONDS)
    # response = upload_json(URL, info)
    # print("\nRéponse du serveur:")
    # print(json.dumps(response, indent=2, ensure_ascii=False))