from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv(override=True)

class DeepSeekService:
    def __init__(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY environment variable is not set")
            
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )

    async def get_completion(self, messages):
        system_prompt = """You are a planner assistant. Your task is to extract and list the main tasks from the user's input.

Rules:
1. Extract only the main high-level tasks
2. Do not break tasks down into subtasks yet
3. Keep task names clear and concise
4. Include a brief one-line description for context

IMPORTANT: You must respond with ONLY a JSON array of task objects. No other text or explanation.
Each task object must have exactly these fields:
- name (string): main task name
- description (string): one-line context or goal
- confirmed (boolean): always set to false initially

Example response format:
[
    {
        "name": "Prepare quarterly report",
        "description": "Create Q4 financial summary for stakeholders",
        "confirmed": false
    }
]"""

        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                stream=False,
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            print(f"Raw API response content: {content}")
            
            # Try to find JSON array in the response
            try:
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    content = json_match.group()
            except:
                pass
                
            result = json.loads(content)
            if not isinstance(result, list):
                print(f"Unexpected response format. Got type: {type(result)}")
                raise ValueError("API response is not in the expected format")
                
            # Validate each task has required fields
            required_fields = {"name", "description", "confirmed"}
            for task in result:
                missing_fields = required_fields - set(task.keys())
                if missing_fields:
                    raise ValueError(f"Task missing required fields: {missing_fields}")
                    
            return result
        except json.JSONDecodeError as e:
            print(f"Failed to parse DeepSeek response: {str(e)}")
            print(f"Raw response content: {content}")
            raise ValueError("Failed to parse AI response")
        except Exception as e:
            print(f"Error in DeepSeek API call: {str(e)}")
            raise ValueError(f"AI service error: {str(e)}")

    async def break_down_task(self, task_name: str, task_description: str):
        system_prompt = """You are a task breakdown assistant. Your job is to break down a task into minimal, actionable subtasks.

Rules:
1. Break down the task into 2-5 subtasks only
2. Each subtask should be clear and actionable
3. Assign realistic time in minutes to each subtask
4. Keep descriptions brief but clear
5. Total time of subtasks should be reasonable for the main task

IMPORTANT: You must respond with ONLY a JSON object. No other text or explanation.
The object must have these fields:
- duration_minutes (number): total time for all subtasks
- priority (number): 1-5, where 1 is highest priority
- subtasks (array): list of subtask objects with:
  - name (string): clear, actionable name
  - duration_minutes (number): realistic time in minutes
  - description (string): brief steps or context

Example response format:
{
    "duration_minutes": 45,
    "priority": 2,
    "subtasks": [
        {
            "name": "Gather financial data",
            "duration_minutes": 15,
            "description": "Download Q4 reports from finance system"
        },
        {
            "name": "Create summary slides",
            "duration_minutes": 30,
            "description": "Make 3-4 slides highlighting key metrics"
        }
    ]
}"""

        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Task: {task_name}\nContext: {task_description}"}
                ],
                stream=False,
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            print(f"Raw API response content: {content}")
            
            result = json.loads(content)
            
            # Validate response format
            required_fields = {"duration_minutes", "priority", "subtasks"}
            missing_fields = required_fields - set(result.keys())
            if missing_fields:
                raise ValueError(f"Response missing required fields: {missing_fields}")
            
            # Validate each subtask
            subtask_fields = {"name", "duration_minutes", "description"}
            for subtask in result["subtasks"]:
                missing_fields = subtask_fields - set(subtask.keys())
                if missing_fields:
                    raise ValueError(f"Subtask missing required fields: {missing_fields}")
            
            return result
        except Exception as e:
            print(f"Error breaking down task: {str(e)}")
            raise ValueError(f"Failed to break down task: {str(e)}") 