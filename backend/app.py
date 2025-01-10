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
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize GPT-4o service
gpt4o_service = GPT4oService()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

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
    user_id: str
    date: str

class Subtask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration_minutes: int
    is_completed: bool = False

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
async def plan(request: PlanRequest):
    try:
        # Generate tasks using GPT-4o
        tasks_data = gpt4o_service.generate_tasks(request.prompt)
        
        # Log the incoming date for debugging
        logger.info(f"Received date from frontend: {request.date}")
        
        # Parse the date string to ensure it's in YYYY-MM-DD format
        try:
            # Validate date format
            datetime.strptime(request.date, "%Y-%m-%d")
        except ValueError as e:
            logger.error(f"Invalid date format: {request.date}")
            raise HTTPException(status_code=400, detail="Date must be in YYYY-MM-DD format")
        
        # Save tasks to Supabase and collect their IDs
        saved_tasks = []
        for task_data in tasks_data:
            # Create task in Supabase
            task_to_save = {
                "user_id": request.user_id,
                "name": task_data["name"],
                "description": task_data["description"],
                "duration_minutes": task_data["duration_minutes"],
                "priority": task_data["priority"],
                "date": request.date,  # This will be stored as a date without time
                "is_completed": False
            }
            
            logger.info(f"Saving task with date: {task_to_save['date']}")
            
            try:
                result = supabase.table("tasks").insert(task_to_save).execute()
                if result.data:
                    saved_task = result.data[0]
                    saved_tasks.append({
                        **task_data,
                        "id": saved_task["id"],
                        "is_completed": False
                    })
                else:
                    logger.error(f"No data returned when saving task: {task_to_save}")
                    raise HTTPException(status_code=500, detail="Failed to save task")
            except Exception as e:
                logger.error(f"Error saving task to Supabase: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
        return {"tasks": saved_tasks}
    except Exception as e:
        logger.error(f"Error in plan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-subtasks")
async def generate_subtasks(request: GenerateSubtasksRequest):
    try:
        # Generate subtasks using GPT-4o
        subtasks_data = gpt4o_service.generate_subtasks(
            request.name,
            request.description,
            request.duration_minutes
        )
        
        # Save subtasks to Supabase and collect their IDs
        saved_subtasks = []
        for subtask_data in subtasks_data:
            subtask_to_save = {
                "task_id": request.task_id,
                "name": subtask_data["name"],
                "description": subtask_data["description"],
                "duration_minutes": subtask_data["duration_minutes"],
                "is_completed": False
            }
            
            try:
                result = supabase.table("subtasks").insert(subtask_to_save).execute()
                if result.data:
                    saved_subtask = result.data[0]
                    saved_subtasks.append({
                        **subtask_data,
                        "id": saved_subtask["id"],
                        "is_completed": False
                    })
                else:
                    logger.error(f"No data returned when saving subtask: {subtask_to_save}")
                    raise HTTPException(status_code=500, detail="Failed to save subtask")
            except Exception as e:
                logger.error(f"Error saving subtask to Supabase: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
        return {"subtasks": saved_subtasks}
    except Exception as e:
        logger.error(f"Error in generate_subtasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)