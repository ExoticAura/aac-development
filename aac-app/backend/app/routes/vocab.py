from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime

from app.routes.packs import PACKS  # reuse the in-memory packs store

router = APIRouter()

# ---------- Models ----------
class VocabItemCreate(BaseModel):
    pack_id: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1, max_length=80)     # what user sees on tile
    say: Optional[str] = Field(default=None, max_length=200)  # spoken text
    icon: Optional[str] = Field(default=None, max_length=200) # URL or icon key
    order: int = 0

class VocabItem(VocabItemCreate):
    id: str
    created_at: str
    updated_at: str

# ---------- In-memory store ----------
VOCAB: Dict[str, VocabItem] = {}

def _seed():
    if VOCAB:
        return
    now = datetime.utcnow().isoformat() + "Z"
    seed_items = [
        ("pack_default_help", "Can you repeat?", "Can you repeat?"),
        ("pack_default_help", "I don't understand", "I don't understand."),
        ("pack_default_help", "I need help", "I need help."),
        ("pack_default_help", "Slower please", "Can you speak slower, please?"),
    ]
    for i, (pack_id, label, say) in enumerate(seed_items):
        item_id = "vocab_" + uuid4().hex[:10]
        VOCAB[item_id] = VocabItem(
            id=item_id,
            pack_id=pack_id,
            label=label,
            say=say,
            icon=None,
            order=i,
            created_at=now,
            updated_at=now,
        )

_seed()

# ---------- Routes ----------
@router.get("", response_model=List[VocabItem])
def list_vocab(pack_id: Optional[str] = Query(default=None)):
    items = list(VOCAB.values())
    if pack_id:
        items = [x for x in items if x.pack_id == pack_id]
    # sort by order then label
    items.sort(key=lambda x: (x.order, x.label.lower()))
    return items

@router.post("", response_model=VocabItem, status_code=201)
def create_vocab(payload: VocabItemCreate):
    # ensure pack exists
    if payload.pack_id not in PACKS:
        raise HTTPException(status_code=400, detail="pack_id does not exist")

    now = datetime.utcnow().isoformat() + "Z"
    item_id = "vocab_" + uuid4().hex[:10]
    item = VocabItem(id=item_id, created_at=now, updated_at=now, **payload.model_dump())
    VOCAB[item_id] = item
    return item

@router.get("/{item_id}", response_model=VocabItem)
def get_vocab(item_id: str):
    item = VOCAB.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Vocab item not found")
    return item

@router.delete("/{item_id}", status_code=204)
def delete_vocab(item_id: str):
    if item_id not in VOCAB:
        raise HTTPException(status_code=404, detail="Vocab item not found")
    del VOCAB[item_id]
    return None
