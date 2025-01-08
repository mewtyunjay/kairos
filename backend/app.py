# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from services.gpt4o import GPT4oService
import re
import logging
import uuid
import uvicorn

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize GPT-4o service
gpt4o_service = GPT4oService()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://192.168.29.63:3000"  # Add your local network URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlanRequest(BaseModel):
    prompt: str

class Subtask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration_minutes: int
    isCompleted: bool = False

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration_minutes: int
    priority: int
    subtasks: Optional[List[Subtask]] = None

class GenerateSubtasksRequest(BaseModel):
    task_id: str
    name: str
    description: str
    duration_minutes: int

@app.post("/api/plan")
def plan(request: PlanRequest):
    try:
        # Generate tasks using GPT-4o
        tasks_data = gpt4o_service.generate_tasks(request.prompt)
        
        # Convert the raw tasks data into Task objects
        tasks = []
        for task_data in tasks_data:
            task = Task(
                name=task_data["name"],
                description=task_data["description"],
                duration_minutes=task_data["duration_minutes"],
                priority=task_data["priority"]
            )
            tasks.append(task)
        
        return {"tasks": tasks}
    except Exception as e:
        logger.error(f"Error in plan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-subtasks")
def generate_subtasks(request: GenerateSubtasksRequest):
    try:
        # Generate subtasks using GPT-4o
        subtasks_data = gpt4o_service.generate_subtasks(
            request.name,
            request.description,
            request.duration_minutes
        )
        
        # Convert the raw subtasks data into Subtask objects
        subtasks = []
        for subtask_data in subtasks_data:
            subtask = Subtask(
                name=subtask_data["name"],
                description=subtask_data["description"],
                duration_minutes=subtask_data["duration_minutes"]
            )
            subtasks.append(subtask)
        
        return {"subtasks": subtasks}
    except Exception as e:
        logger.error(f"Error in generate_subtasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)