
from backend.models.schemas import BookWhisperResponse
from backend.prompts.templates import ANALYZER_PROMPT
from openai import OpenAI
from backend.utils.llm_client import generate_response

class AnalyzerAgent:
    def __init__(self):
        self.client = OpenAI()
       

    def analyze(self, transcript: str) -> BookWhisperResponse:

        data = {
            "system_prompt": ANALYZER_PROMPT,
            "user_prompt": transcript
        }
        
        result = generate_response(self.client, data)
        return  BookWhisperResponse.model_validate_json(result["text"])