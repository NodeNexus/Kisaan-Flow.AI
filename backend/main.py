from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime
import asyncio
import os
import time

# Import our workflow and db
from backend.database.vector_db import init_vector_db
from backend.database.sql_db import init_db, engine, get_session
from backend.database.models import WorkflowExecution
from backend.core.workflow import run_business_workflow
from backend.core.config import settings

# --- Demo Mode ---
# Set DEMO_MODE=true in .env (or Render env) to bypass external API calls during a live demo.
# This broadcasts a pre-recorded, perfectly formatted advisory via WebSocket.
DEMO_MODE = settings.DEMO_MODE

DEMO_ADVISORY = """
# 🌾 आपकी खेती की रिपोर्ट — Kisan Advisory Guide

## फसल सिफारिश (Crop Recommendation)
**सोयाबीन (Soybean)** — महाराष्ट्र की काली मिट्टी और इस साल की अच्छी बारिश के लिए सबसे उपयुक्त फसल।
- बुवाई का समय: जून के अंत से जुलाई 15 तक
- बीज दर: 75 किलो/एकड़ (JS 335 या MACS 450 किस्म)
- उर्वरक: 25 किलो DAP + 25 किलो MOP/एकड़ (बुवाई के समय)

## मंडी भाव (Market Prices)
- नागपुर मंडी सोयाबीन: **₹4,850/क्विंटल** (आज का भाव)
- अनुमानित उत्पादन (5 एकड़): 25-30 क्विंटल
- **अनुमानित आय: ₹1,21,250 – ₹1,45,500**

## सरकारी योजनाएं (Government Schemes)
1. **PM-KISAN**: अगली किस्त अगस्त 2025 में — ₹2,000 आपके बैंक खाते में
2. **PMFBY (फसल बीमा)**: सोयाबीन पर 2% प्रीमियम — रजिस्ट्रेशन 31 जुलाई से पहले करें
3. **Soil Health Card**: अपने KVK से मुफ्त मिट्टी परीक्षण करवाएं

## सप्लाई चेन प्लान (Logistics Plan)
- **भंडारण**: वर्धा एग्री-हब कोल्ड स्टोरेज (निकटतम)
- **बेचने का तरीका**: eNAM पोर्टल पर रजिस्ट्रेशन करें — सीधे खरीदारों से बात करें, बिचौलिया नहीं!
- **FPO सम्पर्क**: अमरावती किसान उत्पादक संगठन — 9876543210

## अगले 30 दिनों में क्या करें?
1. ✅ **आज**: PMFBY के लिए बैंक में रजिस्ट्रेशन करें
2. ✅ **इस हफ्ते**: JS 335 सोयाबीन बीज खरीदें (प्रमाणित बीज केंद्र से)
3. ✅ **अगले सप्ताह**: eNAM पोर्टल पर किसान प्रोफाइल बनाएं
4. ✅ **बुवाई के बाद**: KVK से मिट्टी का नमूना भेजें

🙏 **KisanFlow AI — Powered by AMD Instinct™ MI300X | Fireworks AI**
"""

app = FastAPI(
    title="KisanFlow AI API",
    description="The Autonomous Agricultural Advisor for Indian Farmers",
    version="0.1.0",
)

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, workflow_id: str):
        await websocket.accept()
        if workflow_id not in self.active_connections:
            self.active_connections[workflow_id] = []
        self.active_connections[workflow_id].append(websocket)

    def disconnect(self, websocket: WebSocket, workflow_id: str):
        if workflow_id in self.active_connections:
            self.active_connections[workflow_id].remove(websocket)

    async def broadcast_to_workflow(self, workflow_id: str, message: dict):
        if workflow_id in self.active_connections:
            for connection in self.active_connections[workflow_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.on_event("startup")
def on_startup():
    init_db()
    init_vector_db()

# Enable CORS for frontend integration
# In production: set ALLOWED_ORIGINS to your Render frontend URL in the dashboard
# e.g. ALLOWED_ORIGINS=https://kisanflow-frontend.onrender.com
_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

# ── Static Files (Frontend) ────────────────────────────────────────────────
# Mount the React frontend if the directory exists
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.isdir(STATIC_DIR):
    # Mount assets directory specifically so we can handle the index.html fallback
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    app.mount("/vite.svg", StaticFiles(directory=STATIC_DIR), name="vite_svg")
    # You can add other static files here as needed


class WorkflowRequest(BaseModel):
    prompt: str
    language: str = "English"

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="NeuroFlow AI API is running")

def execute_workflow_task(workflow_id: str, prompt: str, language: str):
    print(f"Starting workflow {workflow_id} for prompt: {prompt} in {language}")
    
    # --- DEMO MODE FAST PATH ---
    # Bypass all external calls and stream a pre-recorded advisory for reliable live demos.
    if DEMO_MODE:
        print(f"[DEMO_MODE] Streaming pre-recorded advisory for workflow {workflow_id}")
        demo_steps = [
            ("status", "Analyzing prompt and forming expert team..."),
            ("thought", "Chief Agronomist: Black soil with 72% monsoon probability — soybean and cotton are primary candidates. Recommending JS 335 soybean variety for highest yield in Vidarbha conditions."),
            ("thought", "Agricultural Economist: Nagpur mandi soybean price today: ₹4,850/quintal. Projected margin at 30 qtl/5 acres: ₹1,45,500. Cotton MSP also strong at ₹7,121 but water requirement is 2x higher."),
            ("thought", "Policy Advisor: PM-KISAN August installment confirmed. PMFBY enrollment open until July 31 — 2% premium for soybean covers entire crop value. Soil health card available free at nearest KVK."),
            ("thought", "Supply Chain: Nearest FPO — Amravati Kisan Producer Org. eNAM registration recommended for direct bidding. Wardha Agri-Hub cold storage has capacity for 3-month soybean storage."),
            ("thought", "Krishi Mitra: Synthesizing all reports into final advisory guide in the requested language..."),
            ("status", "Workflow completed successfully."),
        ]
        for event_type, msg in demo_steps:
            asyncio.run(manager.broadcast_to_workflow(workflow_id, {"type": event_type, "message": msg}))
            time.sleep(2)
        asyncio.run(manager.broadcast_to_workflow(workflow_id, {"type": "result", "data": DEMO_ADVISORY}))
        with Session(engine) as session:
            db_wf = session.exec(select(WorkflowExecution).where(WorkflowExecution.id == workflow_id)).first()
            if db_wf:
                db_wf.status = "completed"
                db_wf.result_text = DEMO_ADVISORY
                db_wf.updated_at = datetime.utcnow()
                session.add(db_wf)
                session.commit()
        return
    # --- END DEMO MODE ---
    
    # Notify via WebSocket that we are starting
    asyncio.run(manager.broadcast_to_workflow(workflow_id, {
        "type": "status", "message": "Analyzing prompt and forming team..."
    }))
    
    def crew_step_callback(step_output):
        try:
            # step_output could be a string or object. Attempt to get a string representation.
            log_msg = str(getattr(step_output, 'log', step_output))
            # Just broadcast it as a thought
            asyncio.run(manager.broadcast_to_workflow(workflow_id, {
                "type": "thought", "agent": "AI Agent", "message": log_msg[:200] + "..." if len(log_msg)>200 else log_msg
            }))
        except Exception as e:
            print("Callback error:", e)

    try:
        result = run_business_workflow(prompt, language, step_callback=crew_step_callback)
        
        # Save to SQL DB
        with Session(engine) as session:
            db_wf = session.exec(select(WorkflowExecution).where(WorkflowExecution.id == workflow_id)).first()
            if db_wf:
                db_wf.status = "completed"
                db_wf.result_text = result
                db_wf.updated_at = datetime.utcnow()
                session.add(db_wf)
                session.commit()
                
        asyncio.run(manager.broadcast_to_workflow(workflow_id, {
            "type": "status", "message": "Workflow completed successfully."
        }))
        asyncio.run(manager.broadcast_to_workflow(workflow_id, {
            "type": "result", "data": result
        }))
        
    except Exception as e:
        print(f"Workflow {workflow_id} failed: {e}")
        with Session(engine) as session:
            db_wf = session.exec(select(WorkflowExecution).where(WorkflowExecution.id == workflow_id)).first()
            if db_wf:
                db_wf.status = "failed"
                db_wf.updated_at = datetime.utcnow()
                session.add(db_wf)
                session.commit()
        asyncio.run(manager.broadcast_to_workflow(workflow_id, {
            "type": "error", "message": str(e)
        }))


@app.post("/api/v1/workflows/start")
async def start_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    new_workflow = WorkflowExecution(prompt=request.prompt, status="running")
    session.add(new_workflow)
    session.commit()
    session.refresh(new_workflow)
    
    background_tasks.add_task(execute_workflow_task, new_workflow.id, request.prompt, request.language)
    return {"status": "started", "workflow_id": new_workflow.id, "prompt": request.prompt, "language": request.language}

@app.get("/api/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, session: Session = Depends(get_session)):
    workflow = session.exec(select(WorkflowExecution).where(WorkflowExecution.id == workflow_id)).first()
    return workflow

@app.websocket("/ws/workflows/{workflow_id}")
async def websocket_endpoint(websocket: WebSocket, workflow_id: str):
    await manager.connect(websocket, workflow_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Can handle incoming WS messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, workflow_id)

# ── SPA Catch-All Route ──────────────────────────────────────────────────
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Catch-all route to serve the React SPA index.html for any unrecognized path.
    This allows client-side routing to work seamlessly.
    """
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend not built or static files missing."}

