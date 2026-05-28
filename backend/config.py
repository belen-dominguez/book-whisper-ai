from dotenv import load_dotenv
import os

load_dotenv()

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Modelos
WHISPER_MODEL = "whisper-1"
GPT_MODEL = "gpt-4o-mini"

# Parámetros del agente
TEMPERATURE = 0.7
MAX_TOKENS = 1000