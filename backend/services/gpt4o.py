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

    def _parse_tasks(self, content: str) -> List[Dict[str, Any]]:
        try:
            # Log raw response
            logger.info(f"Raw response from GPT-4o:\n{content}")
            
            # Extract the JSON part from the response
            json_str = content.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
                logger.info(f"Extracted JSON string:\n{json_str}")
            
            tasks = json.loads(json_str)
            logger.info(f"Parsed {len(tasks)} tasks:\n{json.dumps(tasks, indent=2)}")
            return tasks
        except Exception as e:
            logger.error(f"Error parsing tasks: {e}")
            return []

    def generate_tasks(self, prompt: str) -> List[Dict[str, Any]]:
        logger.info(f"Generating tasks for prompt: {prompt}")
        
        system_prompt = """You are a task planning assistant. Given a user's goals for the day, break them down into specific tasks.
        Each task should have:
        - A clear name
        - A detailed description
        - Estimated duration in minutes
        - Priority (1 being highest)
        Return the response as a JSON array of tasks. Example format:
        ```json
        [
            {
                "name": "Task name",
                "description": "Detailed description",
                "duration_minutes": 30,
                "priority": 1
            }
        ]
        ```
        Keep descriptions concise but informative. Prioritize tasks logically. 
        IMPORTANT: Create exactly one task for each distinct activity mentioned by the user. Do not break down or combine activities unless explicitly requested."""

        try:
            logger.info("Sending request to GPT-4o")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            logger.info("Received response from GPT-4o")
            return self._parse_tasks(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error generating tasks: {e}")
            return []

    def generate_subtasks(self, task_name: str, task_description: str, duration_minutes: int) -> List[Dict[str, Any]]:
        logger.info(f"Generating subtasks for task: {task_name}")
        
        system_prompt = f"""Break down the following task into smaller subtasks:
        Task: {task_name}
        Description: {task_description}
        Total Duration: {duration_minutes} minutes

        Return the subtasks as a JSON array. Example format:
        ```json
        [
            {{
                "name": "Subtask name",
                "description": "Detailed description",
                "duration_minutes": 15
            }}
        ]
        ```
        Ensure the sum of subtask durations equals the total task duration."""

        try:
            logger.info("Sending request to GPT-4o for subtasks")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Break down this task into subtasks: {task_name}"}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            logger.info("Received response from GPT-4o for subtasks")
            return self._parse_tasks(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error generating subtasks: {e}")
            return [] 