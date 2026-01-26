# Quick Start - Adding Colors and Images

## Run the Database Migration

### Step 1: Connect to your PostgreSQL database
```bash
# Replace with your actual connection details
psql -U postgres -d aac_database
```

### Step 2: Run the migration
```sql
-- Add new columns
ALTER TABLE packs ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE packs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE vocab_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Set default colors
UPDATE packs SET color = '#CFE8FF' WHERE subject = 'Math' AND color IS NULL;
UPDATE packs SET color = '#FFE2B8' WHERE subject = 'English' AND color IS NULL;
UPDATE packs SET color = '#FFC7C7' WHERE subject = 'General' AND color IS NULL;
UPDATE packs SET color = '#D6F5D6' WHERE color IS NULL;
```

### Step 3: Restart your backend
```bash
cd aac-app/backend
# Stop the current server (Ctrl+C) then:
uvicorn app.main:app --reload
```

### Step 4: Test it!
Open your app and navigate to the student board. You should see:
- Categories with their colors from the database
- An "OFFLINE" indicator if the backend is not running
- The app automatically falls back to hardcoded data when offline

---

## Try Adding a Custom Color

```sql
-- Make the "Classroom Help" folder bright green
UPDATE packs 
SET color = '#4CAF50' 
WHERE name = 'Classroom';

-- Make the Math folder blue
UPDATE packs 
SET color = '#2196F3' 
WHERE subject = 'Math';
```

Refresh the app to see the changes!

---

## Try Adding an Image to a Tile

```sql
-- Add an image to a vocab item
UPDATE vocab_items 
SET image_url = 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Help' 
WHERE label = 'I need help';
```

**Note**: Replace the placeholder URL with a real image URL from your image hosting service.

---

## That's It! 🎉

Your AAC board now supports:
- ✅ Custom colors from the database
- ✅ Images from the database
- ✅ Offline mode with hardcoded fallback
- ✅ All existing features still work

For more details, see:
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Complete migration instructions
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
