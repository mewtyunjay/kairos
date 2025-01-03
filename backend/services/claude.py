# backend/services/claude.py
import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def process_tasks(user_input: str) -> list:
    system_prompt = """
you are a planner assistant for people with adhd. break down this fuzzy description into concrete, actionable tasks:
1. no task should be longer than 60 minutes
2. if 30 mins is too long, break it down further
3. identify tasks that can be done while waiting for other tasks
4. return ONLY a python list of dictionaries in this format:
[
    {
        "name": "specific task name",
        "description": "concrete steps to complete this task",
        "duration_minutes": 60,  # in minutes
        "has_waiting_periods": true,  # if this task has waiting time
        "waiting_period_length": 45,  # length of waiting period in minutes
        "can_be_interleaved": true  # can other tasks be done during waiting
    }
]
"""
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=system_prompt,
        messages=[
            {"role": "user", "content": f"user input: {user_input}"},
        ],
        max_tokens=2000,
        temperature=0.7,
    )
    
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return []