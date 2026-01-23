from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# ---------- Models ----------
class PackCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=200)
    subject: Optional[str] = Field(default=None, max_length=40)  # e.g. English/Math
    grade: Optional[str] = Field(default=None, max_length=20)    # e.g. P1/P2

class Pack(PackCreate):
    id: str
    created_at: str
    updated_at: str

# ---------- In-memory store ----------
# NOTE: resets whenever server restarts. Great for prototype testing.
PACKS: Dict[str, Pack] = {}

# Seed a default pack so your app isn't empty
def _seed():
    if PACKS:
        return
    now = datetime.utcnow().isoformat() + "Z"
    default = Pack(
        id="pack_default_help",
        name="Classroom Help",
        description="Core classroom help phrases",
        subject="General",
        grade="Any",
        created_at=now,
        updated_at=now,
    )
    PACKS[default.id] = default

_seed()

# ---------- Routes ----------
@router.get("", response_model=List[Pack])
def list_packs():
    return list(PACKS.values())

@router.post("", response_model=Pack, status_code=201)
def create_pack(payload: PackCreate):
    now = datetime.utcnow().isoformat() + "Z"
    pack_id = "pack_" + uuid4().hex[:10]
    pack = Pack(id=pack_id, created_at=now, updated_at=now, **payload.model_dump())
    PACKS[pack_id] = pack
    return pack

@router.get("/{pack_id}", response_model=Pack)
def get_pack(pack_id: str):
    pack = PACKS.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    return pack

@router.delete("/{pack_id}", status_code=204)
def delete_pack(pack_id: str):
    if pack_id not in PACKS:
        raise HTTPException(status_code=404, detail="Pack not found")
    del PACKS[pack_id]
    return None
