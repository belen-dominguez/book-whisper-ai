from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.shared.logger import get_logger
from backend.routes.audio import router
from dotenv import load_dotenv


load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


logger = get_logger(__name__)