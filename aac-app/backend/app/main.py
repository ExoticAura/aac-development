from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import auth, vocab, packs
from app.db import engine, SessionLocal
from app.models_db import Base, Pack, VocabItem
from uuid import uuid4

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


@app.get("/")
def health():
    return {"status": "ok"}


def seed_defaults():
    db = SessionLocal()
    try:
        # Create default pack if missing
        default_pack_id = "pack_default_help"
        pack = db.get(Pack, default_pack_id)
        if not pack:
            pack = Pack(
                id=default_pack_id,
                name="Classroom Help",
                description="Core classroom help phrases",
                subject="General",
                grade="Any",
            )
            db.add(pack)

        # Seed vocab if none exist for this pack
        has_vocab = db.query(VocabItem).filter(VocabItem.pack_id == default_pack_id).first()
        if not has_vocab:
            seed_items = [
                ("Can you repeat?", "Can you repeat?"),
                ("I don't understand", "I don't understand."),
                ("I need help", "I need help."),
                ("Slower please", "Can you speak slower, please?"),
            ]
            for i, (label, say) in enumerate(seed_items):
                item = VocabItem(
                    id="vocab_" + uuid4().hex[:10],
                    pack_id=default_pack_id,
                    label=label,
                    say=say,
                    icon=None,
                    order=i,
                )
                db.add(item)
        
        # Commit all changes in a single transaction
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    # run once on startup
    Base.metadata.create_all(bind=engine)
    seed_defaults()
