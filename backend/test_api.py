import requests

def test_chat_endpoint():
    url = "http://localhost:8000/chat"
    
    payload = {
        "model": "deepseek",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": "What is the capital of France?"}
        ]
    }
    
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response:", response.json())

if __name__ == "__main__":
    test_chat_endpoint() 