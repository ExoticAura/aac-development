# Database Migration: Color and Image Support

## Summary of Changes

This update adds support for:
1. **Custom colors** for packs/categories (stored in database)
2. **Image URLs** for vocab tiles (via the existing `icon` field)

## What Was Changed

### Backend Changes

1. **Database Schema** (`models_db.py`):
   - Added `color` field to `Pack` model (VARCHAR 20)
   - The `icon` field in `VocabItem` can now store either:
     - Icon names (e.g., "refresh-outline")
     - Image URLs (e.g., "https://example.com/image.png")

2. **API** (`routes/packs.py`):
   - Added `color` field to `PackOut` response schema
   - GET `/packs` now returns the color for each pack

3. **Seed Data** (`main.py`):
   - Default packs now include colors:
     - "Classroom Help": `#B3E5FC` (light blue)
     - "Math": `#42A5F5` (blue)

4. **Admin Endpoint** (`routes/admin.py`):
   - Added POST `/admin/migrate/add-color-to-packs` to run the migration

### Frontend Changes

1. **Board Component** (`app/student/board.tsx`):
   - Now fetches packs from the database via API
   - Merges database packs with hardcoded packs (for offline fallback)
   - Database packs are prioritized and displayed first
   - Supports rendering both icons and image URLs:
     - If `icon` starts with `http://` or `https://`, it renders as an `<Image>`
     - Otherwise, it renders as an Ionicon

## How to Apply the Migration

### Option 1: Via API Endpoint (Recommended)

1. Make sure your backend server is running
2. Send a POST request to the admin endpoint:
   ```bash
   curl -X POST http://localhost:8000/admin/migrate/add-color-to-packs
   ```
   Or visit: `http://localhost:8000/docs` and run the migration from the Swagger UI

### Option 2: Manual SQL (if you have direct database access)

Run this SQL against your PostgreSQL database:
```sql
ALTER TABLE packs ADD COLUMN color VARCHAR(20);

UPDATE packs SET color = '#B3E5FC' WHERE id = 'pack_default_help';
UPDATE packs SET color = '#42A5F5' WHERE id = 'pack_default_Math';
```

## How to Use the New Features

### 1. Change Pack/Category Color

Update the `color` field in the database:

**Via Database UI (like in your screenshots):**
1. Open your Postgres database management tool
2. Navigate to the `packs` table
3. Edit the pack row and set the `color` field to any valid hex color (e.g., `#FF5733`)

**Via API (create an update endpoint if needed):**
```python
# Example - add to routes/packs.py
@router.put("/{pack_id}", response_model=PackOut)
def update_pack(pack_id: str, color: str, db: Session = Depends(get_db)):
    pack = db.get(Pack, pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    pack.color = color
    db.commit()
    db.refresh(pack)
    return pack
```

### 2. Add Images to Tiles

Update the `icon` field in the `vocab_items` table:

**For Ionicons (existing behavior):**
```
icon = "refresh-outline"
```

**For Image URLs:**
```
icon = "https://example.com/my-image.png"
```

**For uploaded images (future enhancement):**
- You would need to implement image upload functionality
- Store the uploaded image in cloud storage (e.g., S3, Cloudinary)
- Save the URL in the `icon` field

## Testing

1. **Verify Migration:**
   - Check that the `color` column exists in the `packs` table
   - Verify that existing packs have their default colors set

2. **Test Color Changes:**
   - Update a pack's color in the database
   - Reload the board in the frontend
   - The category pill and header should show the new color

3. **Test Images:**
   - Add an image URL to a vocab item's `icon` field
   - The tile should display the image instead of an Ionicon

## Offline Mode

The hardcoded `PACKS` object in `board.tsx` is preserved and serves as:
- A fallback when the API is unavailable
- Default categories that are always available
- Data source for categories not in the database

Database categories are merged with hardcoded ones, with database categories taking priority.

## Next Steps (Optional Enhancements)

1. **Image Upload:**
   - Add file upload endpoint to backend
   - Integrate with cloud storage (S3, Cloudinary, etc.)
   - Add image picker in frontend

2. **Pack CRUD UI:**
   - Create teacher interface to manage packs
   - Allow color selection with a color picker
   - Enable creating/editing/deleting packs

3. **Sync Mechanism:**
   - Cache database packs locally for offline use
   - Sync changes when connection is restored
