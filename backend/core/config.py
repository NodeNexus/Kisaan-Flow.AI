from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    In production (Render): env vars are set in the dashboard.
    In development: create a backend/.env file (see .env.example).
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    PROJECT_NAME: str = "KisanFlow AI"
    VERSION: str = "0.1.0"

    # ── Database ─────────────────────────────────────────────────────
    # Use SQLite by default for easy, free, zero-config deployment
    DATABASE_URL: str = "sqlite:///./kisanflow.db"

    # ── Qdrant Vector DB ─────────────────────────────────────────────
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    # ── Fireworks AI (AMD MI300X) ─────────────────────────────────────
    FIREWORKS_API_KEY: str = "your-api-key"

    # ── Model Selection ───────────────────────────────────────────────
    # LLaMA 3.1 70B for complex reasoning (runs on AMD Instinct™ MI300X via Fireworks)
    DEFAULT_MODEL: str = "accounts/fireworks/models/llama-v3p1-70b-instruct"
    # LLaMA 3.1 8B for fast lookups and structured tasks
    FAST_MODEL: str = "accounts/fireworks/models/llama-v3p1-8b-instruct"

    # ── Demo Mode ─────────────────────────────────────────────────────
    # Set DEMO_MODE=true for reliable live demos (bypasses external APIs)
    DEMO_MODE: bool = False

    # ── CORS ─────────────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    ALLOWED_ORIGINS: str = "*"

settings = Settings()
