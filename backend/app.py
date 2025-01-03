# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.claude import process_tasks
from services.deepseek import DeepSeekService

app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # svelte dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskInput(BaseModel):
    input: str

@app.post("/process-tasks")
async def handle_tasks(task_input: TaskInput):
    tasks = process_tasks(task_input.input)
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