"""
config.py — Loads environment variables from .env into Python.
Import `settings` anywhere you need env vars.
"""

from dotenv import load_dotenv
import os

# Load .env file from the same directory as this file
load_dotenv()

class Settings:
    # Human Delta (not used yet — placeholder for Phase 2)
    HUMAN_DELTA_API_KEY: str = os.getenv("HUMAN_DELTA_API_KEY", "")
    HUMAN_DELTA_BASE_URL: str = os.getenv("HUMAN_DELTA_BASE_URL", "")

    # OpenAI (not used yet — placeholder for Phase 2)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

# Single instance — import this everywhere
settings = Settings()
