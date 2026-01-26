from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from app.db import get_db
from app.models_db import Pack

router = APIRouter()

class PackOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    grade: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[PackOut])
def list_packs(db: Session = Depends(get_db)):
    return db.query(Pack).order_by(Pack.name.asc()).all()
