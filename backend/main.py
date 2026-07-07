from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime
import asyncio

# Import our workflow and db
from backend.database.vector_db import init_vector_db
from backend.database.sql_db import init_db, engine, get_session
from backend.database.models import WorkflowExecution
from backend.core.workflow import run_business_workflow

app = FastAPI(
    title="NeuroFlow AI API",
    description="The AI Operating System for Businesses",
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

class WorkflowRequest(BaseModel):
    prompt: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="NeuroFlow AI API is running")

def execute_workflow_task(workflow_id: str, prompt: str):
    print(f"Starting workflow {workflow_id} for prompt: {prompt}")
    
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
        result = run_business_workflow(prompt, step_callback=crew_step_callback)
        
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
    
    background_tasks.add_task(execute_workflow_task, new_workflow.id, request.prompt)
    return {"status": "started", "workflow_id": new_workflow.id, "prompt": request.prompt}

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
