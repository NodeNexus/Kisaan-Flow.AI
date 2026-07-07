import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroFlow AI"
    VERSION: str = "0.1.0"
    
    # Qdrant Vector DB
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    
    # Fireworks AI
    FIREWORKS_API_KEY: str = os.getenv("FIREWORKS_API_KEY", "your-api-key")
    
    # Defaults
    DEFAULT_MODEL: str = "accounts/fireworks/models/llama-v3p1-70b-instruct"
    FAST_MODEL: str = "accounts/fireworks/models/llama-v3p1-8b-instruct"

settings = Settings()
