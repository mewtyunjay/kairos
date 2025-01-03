from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

class DeepSeekService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com"
        )

    async def get_completion(self, messages):
        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in DeepSeek API call: {str(e)}")
            return None 