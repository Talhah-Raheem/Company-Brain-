"""
main.py — FastAPI app entry point for Company Brain backend.
Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Create the FastAPI app instance
app = FastAPI(
    title="Company Brain API",
    version="0.1.0",
    description="Hackathon MVP backend",
)

# Allow the Next.js dev server to call this API without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Quick liveness check — returns ok if the server is running."""
    return {"status": "ok"}


# Future routes will be added here in Phase 2:
#   POST /ingest  — upload and process documents
#   POST /chat    — query the knowledge base
