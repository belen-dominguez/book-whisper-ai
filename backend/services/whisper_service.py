
from openai import OpenAI
from backend.config import WHISPER_MODEL
from backend.shared.logger import get_logger

logger = get_logger("WhisperService")

class WhisperService:
    def __init__(self):
        self.client = OpenAI()

    def transcribe_audio(self, audio_file):
        logger.info("Starting transcription of audio file.")

        try:
            with open(audio_file, "rb") as f:
                transcription = self.client.audio.transcriptions.create(
                    model=WHISPER_MODEL,
                    file=f
                )
                logger.info("Transcription complete.")
                return transcription.text
       
        except Exception as e:
            logger.error(f"Error during transcription: {e}")
            raise 