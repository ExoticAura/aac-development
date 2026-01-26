from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import uuid4

from app.db import get_db
from app.models_db import Pack

router = APIRouter()

class PackCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=200)
    subject: Optional[str] = Field(default=None, max_length=60)
    grade: Optional[str] = Field(default=None, max_length=20)
    color: Optional[str] = Field(default=None, max_length=20)

class PackUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=200)
    subject: Optional[str] = Field(default=None, max_length=60)
    grade: Optional[str] = Field(default=None, max_length=20)
    color: Optional[str] = Field(default=None, max_length=20)

class PackOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[PackOut])
def list_packs(db: Session = Depends(get_db)):
    return db.query(Pack).order_by(Pack.name.asc()).all()

@router.post("", response_model=PackOut, status_code=201)
def create_pack(payload: PackCreate, db: Session = Depends(get_db)):
    pack = Pack(
        id="pack_" + uuid4().hex[:10],
        **payload.model_dump(),
    )
    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack

@router.get("/{pack_id}", response_model=PackOut)
def get_pack(pack_id: str, db: Session = Depends(get_db)):
    pack = db.get(Pack, pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    return pack

@router.put("/{pack_id}", response_model=PackOut)
def update_pack(pack_id: str, payload: PackUpdate, db: Session = Depends(get_db)):
    pack = db.get(Pack, pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    pack.name = payload.name
    pack.description = payload.description
    pack.subject = payload.subject
    pack.grade = payload.grade
    pack.color = payload.color
    db.commit()
    db.refresh(pack)
    return pack

@router.delete("/{pack_id}", status_code=204)
def delete_pack(pack_id: str, db: Session = Depends(get_db)):
    pack = db.get(Pack, pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    db.delete(pack)
    db.commit()
    return None
