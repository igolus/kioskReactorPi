from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
import os
import threading

app = FastAPI()

JSON_FILE = "system_info.json"
HTML_FILE = "system_info.html"

@app.get("/")
def index():
    return {
        "message": "API sysinfo prête. Voir /info_system/json ou /info_system/html"
    }

@app.get("/info_system/json", response_class=JSONResponse)
def get_json():
    if not os.path.exists(JSON_FILE):
        return JSONResponse(content={"error": "Fichier JSON non trouvé."}, status_code=404)
    with open(JSON_FILE, encoding="utf-8") as f:
        import json
        data = json.load(f)
    return data

@app.get("/info_system/html", response_class=HTMLResponse)
def get_html():
    if not os.path.exists(HTML_FILE):
        return HTMLResponse(content="<h2>Fichier HTML non trouvé.</h2>", status_code=404)
    with open(HTML_FILE, encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(content=html, status_code=200)

@app.get("/info_system/download/{fmt}")
def download(fmt: str):
    filename = JSON_FILE if fmt == "json" else HTML_FILE if fmt == "html" else None
    if filename and os.path.exists(filename):
        return FileResponse(filename, filename=filename)
    return {"error": "Fichier non trouvé."}

def start_api(host="0.0.0.0", port=4000, reload=False):
    """
    Démarre l'API FastAPI dans un thread (idéal en import)
    """
    import uvicorn
    # Trick: reload ne fonctionne pas en thread, on l’ignore ici
    config = uvicorn.Config("api:app", host=host, port=port, reload=False, log_level="info")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    return thread

if __name__ == "__main__":
    # Lancement direct : API FastAPI bloquante
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=4000, reload=True)
