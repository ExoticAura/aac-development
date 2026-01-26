"""
Migration script to add color column to packs table
Run this script from the backend directory
"""
import os
import sys
from sqlalchemy import create_engine, text

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import DATABASE_URL

def run_migration():
    print("Running migration: add_color_to_packs")
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='packs' AND column_name='color'
        """))
        
        if result.fetchone():
            print("✓ Color column already exists")
            return
        
        # Add color column
        print("Adding color column to packs table...")
        conn.execute(text("ALTER TABLE packs ADD COLUMN color VARCHAR(20)"))
        
        # Set default colors for existing packs
        print("Setting default colors for existing packs...")
        conn.execute(text("""
            UPDATE packs 
            SET color = '#B3E5FC' 
            WHERE id = 'pack_default_help'
        """))
        
        conn.execute(text("""
            UPDATE packs 
            SET color = '#42A5F5' 
            WHERE id = 'pack_default_Math'
        """))
        
        conn.commit()
        print("✓ Migration completed successfully")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        sys.exit(1)
