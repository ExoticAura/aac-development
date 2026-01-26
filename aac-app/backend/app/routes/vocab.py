from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4
from sqlalchemy.orm import Session

from app.db import get_db
from app.models_db import VocabItem, Pack

router = APIRouter()

class VocabItemCreate(BaseModel):
    pack_id: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1, max_length=80)
    say: Optional[str] = Field(default=None, max_length=200)
    icon: Optional[str] = Field(default=None, max_length=200)
    order: int = 0

class VocabItemOut(VocabItemCreate):
    id: str

    class Config:
        from_attributes = True

class VocabItemUpdate(BaseModel):
    pack_id: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1, max_length=80)
    say: Optional[str] = Field(default=None, max_length=200)
    icon: Optional[str] = Field(default=None, max_length=200)
    order: int = 0

@router.get("", response_model=List[VocabItemOut])
def list_vocab(
    pack_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(VocabItem)
    if pack_id:
        q = q.filter(VocabItem.pack_id == pack_id)
    return q.order_by(VocabItem.order.asc(), VocabItem.label.asc()).all()

@router.post("", response_model=VocabItemOut, status_code=201)
def create_vocab(payload: VocabItemCreate, db: Session = Depends(get_db)):
    pack = db.get(Pack, payload.pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="pack_id does not exist")

    item = VocabItem(
        id="vocab_" + uuid4().hex[:10],
        **payload.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{item_id}", response_model=VocabItemOut)
def get_vocab(item_id: str, db: Session = Depends(get_db)):
    item = db.get(VocabItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Vocab item not found")
    return item

@router.put("/{item_id}", response_model=VocabItemOut)
def update_vocab(item_id: str, payload: VocabItemUpdate, db: Session = Depends(get_db)):
    item = db.get(VocabItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Vocab item not found")

    pack = db.get(Pack, payload.pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="pack_id does not exist")

    item.pack_id = payload.pack_id
    item.label = payload.label
    item.say = payload.say
    item.icon = payload.icon
    item.order = payload.order
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=204)
def delete_vocab(item_id: str, db: Session = Depends(get_db)):
    item = db.get(VocabItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Vocab item not found")
    db.delete(item)
    db.commit()
    return None
