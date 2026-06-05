
from openai import OpenAI
import json
from backend.models.schemas import BookWhisperResponse
from backend.prompts.templates import ANALYZER_PROMPT
from backend.utils.llm_client import generate_response
from backend.shared.logger import get_logger

logger = get_logger("AnalyzerAgent")

class AnalyzerAgent:
    def __init__(self):
        self.client = OpenAI()
       

    def analyze(self, transcript: str, titulo_libro: str | None = None) -> BookWhisperResponse:
        logger.info("Starting analysis of transcript.")
        data = {
            "system_prompt": ANALYZER_PROMPT,
            "user_prompt": transcript
        }
        result = generate_response(self.client, data)
        parsed = json.loads(result["text"])
        
        # inyectamos el título si vino del audio
        if titulo_libro is not None:
            parsed["titulo_libro"] = titulo_libro

        logger.info("Analysis complete.")
        return BookWhisperResponse.model_validate(parsed)