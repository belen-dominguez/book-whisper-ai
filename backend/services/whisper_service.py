
from openai import OpenAI
from backend.config import WHISPER_MODEL


class WhisperService:
    def __init__(self):
        self.client = OpenAI()

    def transcribe_audio(self, audio_file):
        with open(audio_file, "rb") as f:
                transcription = self.client.audio.transcriptions.create(
                    model=WHISPER_MODEL,
                    file=f
                )
                return transcription.text