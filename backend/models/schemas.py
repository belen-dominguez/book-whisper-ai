from pydantic import BaseModel, Field

class BookWhisperResponse(BaseModel):
    frase_transcripta: str = Field(..., description="La frase transcripta del audio")
    tema: str = Field(..., description="El tema principal de la frase")
    tono: str = Field(..., description="El tono de la frase (e.g., inspirador, motivacional, reflexivo)")
    recomendaciones: list[str] = Field(..., description="Lista de recomendaciones basadas en la frase")
    frases_celebres: list[str] | None = None
    pregunta_reflexion: str = Field(..., description="Pregunta para la reflexión basada en la frase")