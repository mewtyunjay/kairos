import os
import json
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

class DeepSeekService:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY environment variable is not set")
        
        self.api_url = "https://api.deepseek.com/v1/chat/completions"
        self.model = "deepseek-chat"
    
    def get_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Any:
        """
        Get a completion from the DeepSeek API.
        Returns parsed JSON response for structured data.
        """
        messages = []
        
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        try:
            response = httpx.post(
                self.api_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "response_format": { "type": "json_object" }
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            completion = response.json()
            
            # Extract and parse the JSON response
            try:
                content = completion["choices"][0]["message"]["content"]
                return json.loads(content)
            except (KeyError, json.JSONDecodeError) as e:
                raise ValueError(f"Failed to parse API response: {str(e)}")
            
        except httpx.HTTPError as e:
            raise ValueError(f"API request failed: {str(e)}")
        except Exception as e:
            raise ValueError(f"Unexpected error: {str(e)}")

    def estimate_task_time(self, task_description: str) -> int:
        """
        Estimate the time required for a task in minutes.
        """
        system_prompt = """
        Analyze the task description and estimate how long it would take to complete in minutes.
        Consider:
        1. Task complexity
        2. Required focus and concentration
        3. Realistic human capabilities
        4. Potential interruptions or context switching
        
        Return a single number representing the estimated minutes.
        """
        
        try:
            result = self.get_completion(
                task_description,
                system_prompt=system_prompt,
                temperature=0.3
            )
            
            if isinstance(result, dict) and "duration_minutes" in result:
                return result["duration_minutes"]
            
            raise ValueError("Invalid time estimation format")
        except Exception as e:
            # Default to 30 minutes if estimation fails
            return 30 