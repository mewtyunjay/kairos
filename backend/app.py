# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.claude import process_tasks
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

@app.post("/plan")
async def handle_tasks(task_input: TaskInput):
    tasks = process_tasks(task_input.prompt)
    return {"tasks": tasks}

deepseek_service = DeepSeekService()

@app.post("/chat")
async def chat(request: ChatRequest):
    if request.model == AIModel.CLAUDE:
        response = await claude_service.get_completion(request.messages)
    elif request.model == AIModel.DEEPSEEK:
        response = await deepseek_service.get_completion(request.messages)
    else:
        raise HTTPException(status_code=400, detail="Invalid model specified")
    
    return {"response": response}