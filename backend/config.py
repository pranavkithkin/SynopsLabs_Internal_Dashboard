import os
from pathlib import Path
from dotenv import load_dotenv

# Get the absolute path to the backend directory
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / '.env'

# Load environment variables
load_dotenv(ENV_FILE)

class Settings:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

settings = Settings()
