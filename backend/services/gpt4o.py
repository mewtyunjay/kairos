import os
from openai import OpenAI
from typing import List, Dict, Any
import json
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GPT4oService:
    def __init__(self):
        load_dotenv()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"  
        self.max_tokens = 1000
        self.temperature = 0.7

    def generate_tasks(self, prompt: str) -> List[Dict[str, Any]]:
        logger.info(f"Generating tasks for prompt: {prompt}")
        
        try:
            logger.info("Sending request to GPT-4o mini")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a task planning assistant. Given a user's goals for the day, break them down into specific tasks. Create exactly one task for each distinct activity mentioned by the user. Do not break down or combine activities unless explicitly requested."},
                    {"role": "user", "content": prompt}
                ],
                functions=[{
                    "name": "create_tasks",
                    "description": "Create a list of tasks based on user input",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "tasks": {
                                "type": "array",
                                "description": "List of tasks",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string",
                                            "description": "Clear, concise task name"
                                        },
                                        "description": {
                                            "type": "string",
                                            "description": "Detailed description of what needs to be done"
                                        },
                                        "duration_minutes": {
                                            "type": "integer",
                                            "description": "Estimated duration in minutes"
                                        },
                                        "priority": {
                                            "type": "integer",
                                            "description": "Task priority (1 being highest)",
                                            "minimum": 1,
                                            "maximum": 5
                                        }
                                    },
                                    "required": ["name", "description", "duration_minutes", "priority"]
                                }
                            }
                        },
                        "required": ["tasks"]
                    }
                }],
                function_call={"name": "create_tasks"}
            )
            
            logger.info("Received response from GPT-4o mini")
            result = json.loads(response.choices[0].message.function_call.arguments)
            logger.info(f"Parsed {len(result['tasks'])} tasks:\n{json.dumps(result['tasks'], indent=2)}")
            return result['tasks']
        except Exception as e:
            logger.error(f"Error generating tasks: {e}")
            return []

    def generate_subtasks(self, task_name: str, task_description: str, duration_minutes: int) -> List[Dict[str, Any]]:
        logger.info(f"Generating subtasks for task: {task_name}")
        
        try:
            logger.info("Sending request to GPT-4o-mini for subtasks")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a task breakdown assistant. Break down the given task into smaller, manageable subtasks."},
                    {"role": "user", "content": f"Break down this task into subtasks:\nTask: {task_name}\nDescription: {task_description}\nTotal Duration: {duration_minutes} minutes"}
                ],
                functions=[{
                    "name": "create_subtasks",
                    "description": "Create a list of subtasks that add up to the main task's duration",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "subtasks": {
                                "type": "array",
                                "description": "List of subtasks that make up the main task",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string",
                                            "description": "Clear, concise subtask name"
                                        },
                                        "description": {
                                            "type": "string",
                                            "description": "Detailed description of what needs to be done"
                                        },
                                        "duration_minutes": {
                                            "type": "integer",
                                            "description": "Estimated duration in minutes (should be between 5-30 minutes)"
                                        }
                                    },
                                    "required": ["name", "description", "duration_minutes"]
                                }
                            }
                        },
                        "required": ["subtasks"]
                    }
                }],
                function_call={"name": "create_subtasks"}
            )
            
            logger.info("Received response from GPT-4o-mini for subtasks")
            result = json.loads(response.choices[0].message.function_call.arguments)
            logger.info(f"Parsed {len(result['subtasks'])} subtasks:\n{json.dumps(result['subtasks'], indent=2)}")
            return result['subtasks']
        except Exception as e:
            logger.error(f"Error generating subtasks: {e}")
            return [] 