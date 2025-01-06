# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from services.deepseek import DeepSeekService
import re
import logging
import uuid
import uvicorn

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

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

deepseek = DeepSeekService()

@app.post("/api/plan")
async def plan(request: PlanRequest):
    logger.info(f"Received plan request with prompt: {request.prompt}")
    
    if not request.prompt:
        logger.warning("Empty prompt received")
        raise HTTPException(status_code=400, detail="No prompt provided")
    
    try:
        response = deepseek.get_completion(
            request.prompt,
            system_prompt="""
            Analyze the user's input and create tasks with realistic time estimates.
            
            Rules:
            1. If the user specifies a time for a task (e.g., "write a blog in 5 hours"), use that exact time
            2. Keep the task as a single unit if it's described as one task with a time specification
            3. Only break into multiple tasks if the user lists multiple distinct tasks
            4. For unspecified times, estimate based on task complexity (15-120 minutes)
            5. Assign priority (1-5, 1 being highest) based on urgency or complexity
            
            Format each task as a JSON object with:
            {
                "name": "Task name",
                "description": "Clear description of what needs to be done",
                "duration_minutes": estimated_minutes,
                "priority": priority_number
            }
            
            Return a list of these task objects in a JSON object with a 'tasks' key.
            
            Examples:
            - Input: "write a blog in 5 hours"
              Output: One task with duration_minutes = 300
            - Input: "write a blog and meet a friend"
              Output: Two separate tasks with estimated durations
            """
        )
        
        if not isinstance(response, dict) or 'tasks' not in response or not isinstance(response['tasks'], list):
            logger.error(f"Invalid response format received: {response}")
            raise ValueError("Invalid response format from AI service")
        
        # Add UUIDs to tasks
        tasks_with_ids = [Task(**task).dict() for task in response['tasks']]
        logger.info(f"Generated tasks: {tasks_with_ids}")
        
        return {"tasks": tasks_with_ids}
    except Exception as e:
        logger.error(f"Error in plan endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-subtasks")
async def generate_subtasks(request: GenerateSubtasksRequest):
    logger.info(f"Received subtask generation request for task: {request.name}")
    
    try:
        # Update the system prompt to focus on subtask breakdown
        response = deepseek.get_completion(
            f"Break down this task: {request.name}\nDescription: {request.description}\nTotal time: {request.duration_minutes} minutes",
            system_prompt="""
            Break down the given task into smaller subtasks that are easier to manage.
            For each subtask:
            1. Provide a clear name and description
            2. Estimate duration in minutes
            3. Ensure subtasks total up to the main task's duration
            4. Keep subtasks between 5-30 minutes each
            
            Format each subtask as a JSON object with:
            {
                "name": "Subtask name",
                "description": "Clear description",
                "duration_minutes": estimated_minutes
            }
            
            Return a list of these subtask objects in a JSON object with a 'subtasks' key.
            """
        )
        
        if not isinstance(response, dict) or 'subtasks' not in response or not isinstance(response['subtasks'], list):
            logger.error(f"Invalid response format received: {response}")
            raise ValueError("Invalid response format from AI service")
        
        # Add UUIDs to subtasks
        subtasks_with_ids = [Subtask(**subtask).dict() for subtask in response['subtasks']]
        logger.info(f"Generated subtasks: {subtasks_with_ids}")
        
        return {"subtasks": subtasks_with_ids}
    except Exception as e:
        logger.error(f"Error in generate-subtasks endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    
    uvicorn.run(app, host="127.0.0.1", port=8000)