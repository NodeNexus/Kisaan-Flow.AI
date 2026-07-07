from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class WorkflowExecution(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    prompt: str
    status: str = Field(default="pending") # pending, running, completed, failed
    result_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
