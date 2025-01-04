import pytest
import requests
import json
from models import AIModel

BASE_URL = "http://localhost:8000"

def validate_task_structure(task):
    """Helper function to validate task dictionary structure"""
    assert "name" in task, "Task missing 'name' field"
    assert "description" in task, "Task missing 'description' field"
    assert "duration_minutes" in task, "Task missing 'duration_minutes' field"
    assert "has_waiting_periods" in task, "Task missing 'has_waiting_periods' field"
    assert "waiting_period_length" in task, "Task missing 'waiting_period_length' field"
    assert "can_be_interleaved" in task, "Task missing 'can_be_interleaved' field"
    
    assert isinstance(task["name"], str)
    assert isinstance(task["description"], str)
    assert isinstance(task["duration_minutes"], int)
    assert isinstance(task["has_waiting_periods"], bool)
    assert isinstance(task["waiting_period_length"], int)
    assert isinstance(task["can_be_interleaved"], bool)

def test_plan_endpoint_room_cleaning():
    url = f"{BASE_URL}/plan"
    payload = {
        "prompt": "I need to deep clean my messy bedroom. It has clothes everywhere, dusty surfaces, and needs vacuuming. I get overwhelmed easily and need this broken down into manageable steps."
    }
    
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    
    # Parse the tasks string into a list of dictionaries
    tasks = json.loads(data["tasks"])
    assert isinstance(tasks, list)
    assert len(tasks) > 0, "Should return at least one task"
    
    # Validate each task's structure
    for task in tasks:
        validate_task_structure(task)
        # Validate task duration constraints
        assert task["duration_minutes"] <= 60, "Task duration should not exceed 60 minutes"

def test_plan_endpoint_study_session():
    url = f"{BASE_URL}/plan"
    payload = {
        "prompt": "I need to study for my upcoming math exam. The topics are calculus derivatives and integrals. I have 3 hours available but need frequent breaks to stay focused."
    }
    
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    data = response.json()
    tasks = json.loads(data["tasks"])
    
    for task in tasks:
        validate_task_structure(task)
        assert task["duration_minutes"] <= 60
        if task["has_waiting_periods"]:
            assert task["waiting_period_length"] > 0

def test_chat_endpoint_deepseek():
    url = f"{BASE_URL}/chat"
    payload = {
        "model": AIModel.DEEPSEEK,
        "messages": [
            {"role": "system", "content": "You are a helpful task planning assistant."},
            {"role": "user", "content": "Break down the process of organizing my digital files and photos into manageable tasks."}
        ]
    }
    
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    
    # Try parsing the response as JSON to ensure it's valid task format
    tasks = json.loads(data["response"])
    assert isinstance(tasks, list)
    for task in tasks:
        validate_task_structure(task)

def test_chat_endpoint_claude():
    url = f"{BASE_URL}/chat"
    payload = {
        "model": AIModel.CLAUDE,
        "messages": [
            {"role": "system", "content": "You are a helpful task planning assistant."},
            {"role": "user", "content": "Help me plan a small dinner party for 6 people, including preparation and cleanup."}
        ]
    }
    
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    
    tasks = json.loads(data["response"])
    assert isinstance(tasks, list)
    for task in tasks:
        validate_task_structure(task)

def test_chat_endpoint_invalid_model():
    url = f"{BASE_URL}/chat"
    payload = {
        "model": "invalid_model",
        "messages": [
            {"role": "user", "content": "Break this down into tasks"}
        ]
    }
    
    response = requests.post(url, json=payload)
    assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__]) 