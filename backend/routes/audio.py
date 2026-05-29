import os
import tempfile
from fastapi import APIRouter,  UploadFile
from backend.agents.analyzer_agent import AnalyzerAgent
from backend.services.whisper_service import WhisperService
from backend.shared.logger import get_logger


logger = get_logger('audio_router')
router = APIRouter()
whisperService = WhisperService()
analyzerAgent = AnalyzerAgent()

@router.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    logger.info(f"Received file: {file.filename}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
        content = await file.read()      # 1. leemos el audio que mandó el front
        temp_file.write(content)         # 2. lo escribimos en el archivo temporal
        temp_path = temp_file.name       # 3. guardamos la ruta

        
    transcript = whisperService.transcribe_audio(temp_path) # 4. transcribimos
    result = analyzerAgent.analyze(transcript) # 5. analizamos
    
    os.remove(temp_path)    # 6. borramos el temporal
    logger.info(f"Analysis complete for file: {file.filename}")
    return result