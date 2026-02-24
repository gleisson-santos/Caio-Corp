import os
import subprocess
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

app = FastAPI(title="Nanobot Gateway API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; could be narrowed to [ "http://localhost:5173" ]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store references to gateway components
_agent = None
_bus = None
_config = None
_cron = None

class StatusResponse(BaseModel):
    status: str
    uptime: str
    tokens_today: int
    alerts: int
    services: List[dict]

class AgentResponse(BaseModel):
    id: str
    name: str
    role: str
    status: str
    tier: int
    capabilities: List[str]

@app.get("/api/status")
async def get_status():
    if not _agent:
        return {"status": "starting"}
    
    # In a real impl, we'd pull these from metrics collectors
    return {
        "status": "online",
        "uptime": "1h 12m",
        "tokens_today": 12450,
        "alerts": 0,
        "services": [
            {"id": "tg", "name": "Telegram", "status": "online", "uptime": "1h 12m", "response": "120ms"},
            {"id": "email", "name": "Email", "status": "online", "uptime": "1h 10m", "response": "4s"},
        ]
    }

@app.get("/api/agents")
async def get_agents():
    # Return real agents or a merged list
    return [
        {
            "id": "caio-ceo",
            "name": "Caio (CEO)",
            "role": "Orquestrador Principal",
            "status": "online",
            "tier": 0,
            "capabilities": ["Orquestração", "Decisão", "Memória Longo Prazo"]
        },
        {
            "id": "sentinel",
            "name": "Sentinel",
            "role": "Monitor de E-mails",
            "status": "busy",
            "tier": 1,
            "capabilities": ["IMAP/SMTP", "Análise de Spam", "Alertas Urgentes"]
        }
    ]

@app.get("/api/tasks")
async def get_tasks():
    # This would pull from the agent's active task queue
    return []

@app.post("/api/extras/generate/{script_type}")
async def generate_extra(script_type: str, background_tasks: BackgroundTasks):
    """Execute scripts from nanobot/extras."""
    scripts = {
        "pdf": "generate_pdf.py",
        "pptx": "generate_pptx.py",
        "xlsx": "generate_xlsx.py",
        "docx": "generate_docx.py"
    }
    
    if script_type not in scripts:
        raise HTTPException(status_code=404, detail="Script type not found")
    
    script_path = os.path.join(os.getcwd(), "nanobot", "extras", scripts[script_type])
    
    if not os.path.exists(script_path):
        raise HTTPException(status_code=500, detail=f"Script file {scripts[script_type]} missing")

    def run_script():
        try:
            logger.info(f"API: Running extra script {script_path}")
            subprocess.run(["python", script_path], check=True)
        except Exception as e:
            logger.error(f"API: Error running script: {e}")

    background_tasks.add_task(run_script)
    return {"message": f"Execution of {script_type} generator started in background"}

def start_api(agent, bus, config, cron):
    global _agent, _bus, _config, _cron
    _agent = agent
    _bus = bus
    _config = config
    _cron = cron
    
    import uvicorn
    # We run uvicorn in a separate thread to not block the agent loop
    import threading
    
    def run():
        uvicorn.run(app, host="0.0.0.0", port=18791, log_level="info")
    
    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    logger.info("Nanobot API Server started on port 18791")
