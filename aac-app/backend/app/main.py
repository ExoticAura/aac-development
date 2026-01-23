from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import auth, vocab, packs, user_vocab

app = FastAPI(title="AAC School App API")

# Configure CORS to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo dev server
        "http://127.0.0.1:8081",  # Alternative localhost
        "http://localhost:19006",  # Expo web
        "*"  # Allow all in development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(vocab.router, prefix="/vocab", tags=["vocab"])
app.include_router(packs.router, prefix="/packs", tags=["packs"])
app.include_router(user_vocab.router, prefix="/api/vocabulary", tags=["user-vocabulary"])


@app.get("/")
def health():
    return {"status": "ok"}
