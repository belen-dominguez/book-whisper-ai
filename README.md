# 📚 Book Whisper

> Grabá una frase de un libro y descubrí tu próxima lectura.

Book Whisper es una aplicación web que transcribe frases de libros a partir de audio y, usando inteligencia artificial, analiza el contenido para ofrecer recomendaciones literarias personalizadas, frases célebres relacionadas y preguntas de reflexión.

## Cómo funciona

1. **Grabás** una frase de un libro usando el micrófono del navegador.
2. **Whisper** (OpenAI) transcribe el audio a texto.
3. Un **agente analizador** (GPT-4o-mini) identifica el tema y tono de la frase.
4. Recibís **recomendaciones de libros**, frases célebres y una pregunta para reflexionar.
5. Podés **guardar** el análisis en Supabase para conservar tu historial de lecturas.

## Tech Stack

| Capa          | Tecnología                      |
| ------------- | ------------------------------- |
| Frontend      | HTML, CSS, JavaScript (vanilla) |
| Backend       | Python 3.13+, FastAPI, Uvicorn  |
| Transcripción | OpenAI Whisper API              |
| Análisis      | OpenAI GPT-4o-mini              |
| Persistencia  | Supabase                        |
| Validación    | Pydantic                        |

## Estructura del proyecto

```
bookwhisper/
├── pyproject.toml
├── backend/
│   ├── main.py              # App FastAPI + CORS
│   ├── config.py            # Variables de entorno y parámetros
│   ├── agents/
│   │   └── analyzer_agent.py    # Agente que analiza la transcripción
│   ├── models/
│   │   └── schemas.py           # Modelos Pydantic de respuesta
│   ├── prompts/
│   │   └── templates.py         # Prompt del agente analizador
│   ├── routes/
│   │   └── audio.py             # Endpoint POST /uploadfile/
│   ├── services/
│   │   └── whisper_service.py   # Servicio de transcripción con Whisper
│   ├── shared/
│   │   └── logger.py            # Logger compartido
│   └── utils/
│       └── llm_client.py        # Cliente genérico para OpenAI Responses API
└── frontend/
    ├── index.html           # UI principal
    ├── style.css            # Estilos
    ├── app.js               # Lógica de grabación y renderizado
    └── config.js            # Config de Supabase
```

## Requisitos previos

- Python 3.13+
- Una API key de OpenAI con acceso a Whisper y GPT-4o-mini

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bookwhisper.git
cd bookwhisper

# Crear entorno virtual e instalar dependencias
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto:

```env
OPENAI_API_KEY=tu-api-key
```

## Uso

```bash
chmod +x run.sh
./run.sh
```

Esto levanta el backend con hot-reload y abre el frontend en el navegador automáticamente.

### Alternativa manual

```bash
uvicorn backend.main:app --reload
```

El servidor se inicia en `http://127.0.0.1:8000`. Abrir `frontend/index.html` en el navegador por separado.

## API

### `POST /uploadfile/`

Recibe un archivo de audio (`.webm`) y devuelve el análisis completo.

**Response:**

```json
{
  "frase_transcripta": "texto transcripto del audio",
  "tema": "tema central",
  "tono": "tono detectado",
  "recomendaciones": [
    { "titulo": "...", "autor": "...", "explicacion": "..." }
  ],
  "frases_celebres": [{ "frase": "...", "autor": "..." }],
  "pregunta_reflexion": "una pregunta profunda basada en el tema"
}
```

## Persistencia con Supabase

Al hacer click en **Guardar**, el análisis completo se almacena en una tabla `analisis` en Supabase con los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| `frase` | La frase transcripta del audio |
| `tema` | Tema central detectado |
| `tono` | Tono del texto |
| `recomendaciones` | JSON con las recomendaciones de libros |
| `frases_celebres` | JSON con frases célebres relacionadas |
| `pregunta_reflexion` | Pregunta de reflexión generada |

La conexión a Supabase se configura en `frontend/config.js` con la URL y la key del proyecto.
