# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.deepseek import DeepSeekService
from typing import List
from models import AIModel

app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskInput(BaseModel):
    prompt: str

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: AIModel
    messages: List[Message]

class TaskBreakdownRequest(BaseModel):
    name: str
    description: str

deepseek_service = DeepSeekService()

@app.post("/plan")
async def handle_tasks(task_input: TaskInput):
    try:
        response = await deepseek_service.get_completion([
            {"role": "user", "content": task_input.prompt}
        ])
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate tasks")
        return {"tasks": response}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in /plan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/breakdown")
async def break_down_task(task: TaskBreakdownRequest):
    try:
        response = await deepseek_service.break_down_task(task.name, task.description)
        return response
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in /breakdown endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/chat")
async def chat(request: ChatRequest):
    if request.model != AIModel.DEEPSEEK:
        raise HTTPException(status_code=400, detail="Only Deepseek model is supported")
    
    try:
        response = await deepseek_service.get_completion(request.messages)
        return {"response": response}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")