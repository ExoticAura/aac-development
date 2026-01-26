"""
Admin utilities for database migrations
Add this router to main.py temporarily to run migrations
"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/migrate/add-color-to-packs")
def migrate_add_color_to_packs(db: Session = Depends(get_db)):
    """Add color column to packs table"""
    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='packs' AND column_name='color'
        """))
        
        if result.fetchone():
            return {"status": "success", "message": "Color column already exists"}
        
        # Add color column
        db.execute(text("ALTER TABLE packs ADD COLUMN color VARCHAR(20)"))
        
        # Set default colors for existing packs
        db.execute(text("""
            UPDATE packs 
            SET color = '#B3E5FC' 
            WHERE id = 'pack_default_help'
        """))
        
        db.execute(text("""
            UPDATE packs 
            SET color = '#42A5F5' 
            WHERE id = 'pack_default_Math'
        """))
        
        db.commit()
        
        return {
            "status": "success",
            "message": "Migration completed successfully. Color column added and default colors set."
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
