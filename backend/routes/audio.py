import os
import tempfile
from fastapi import APIRouter, UploadFile
from backend.agents.analyzer_agent import AnalyzerAgent
from backend.services.whisper_service import WhisperService
from backend.shared.logger import get_logger

logger = get_logger('audio_router')
router = APIRouter()
whisperService = WhisperService()
analyzerAgent = AnalyzerAgent()

PREFIJOS_TITULO = ["libro:", "película:", "pelicula:", "film:", "serie:"]

@router.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    logger.info(f"Received file: {file.filename}")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    transcript = whisperService.transcribe_audio(temp_path)  # 4. transcribimos

    # 5. extraemos título si viene con prefijo
    titulo_libro = None
    transcript_lower = transcript.lower()
    for prefijo in PREFIJOS_TITULO:
        if transcript_lower.startswith(prefijo):
            partes = transcript.split(".", 1)
            titulo_libro = partes[0][len(prefijo):].strip()
            transcript = partes[1].strip() if len(partes) > 1 else transcript
            break

    result = analyzerAgent.analyze(transcript, titulo_libro)  # 6. analizamos
    os.remove(temp_path)  # 7. borramos el temporal
    logger.info(f"Analysis complete for file: {file.filename}")
    return result