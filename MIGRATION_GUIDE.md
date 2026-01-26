# Database Migration Guide - Color & Image Support

## Overview
This migration adds support for custom colors and images to your AAC packs and vocabulary items.

### New Features
- **Pack Colors**: Each pack/category can have a custom hex color (e.g., `#FFE2B8`)
- **Pack Images**: Each pack/category can have an image URL
- **Tile Images**: Individual vocabulary tiles can have image URLs
- **Offline Mode**: The app will automatically fall back to hardcoded data if the API is unavailable

---

## Step 1: Run the Database Migration

### Option A: Using PostgreSQL command line
```bash
# Connect to your database
psql -U your_username -d your_database_name

# Run the migration file
\i aac-app/backend/migrations/add_color_and_image_support.sql
```

### Option B: Using a SQL client
1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open and execute the file: `aac-app/backend/migrations/add_color_and_image_support.sql`

### Option C: Manual SQL execution
Run this SQL directly in your database:

```sql
-- Add color and image_url to packs table
ALTER TABLE packs ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE packs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add image_url to vocab_items table
ALTER TABLE vocab_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Set default colors for existing packs
UPDATE packs SET color = '#CFE8FF' WHERE subject = 'Math' AND color IS NULL;
UPDATE packs SET color = '#FFE2B8' WHERE subject = 'English' AND color IS NULL;
UPDATE packs SET color = '#FFC7C7' WHERE subject = 'General' AND color IS NULL;
UPDATE packs SET color = '#D6F5D6' WHERE color IS NULL;
```

---

## Step 2: Verify the Migration

Check that the new columns exist:
```sql
-- Check packs table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'packs';

-- Check vocab_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vocab_items';
```

---

## Step 3: Test the Changes

### Backend Testing
1. Restart your backend server:
   ```bash
   cd aac-app/backend
   # If using uvicorn directly:
   uvicorn app.main:app --reload
   
   # Or if using Docker:
   docker-compose restart backend
   ```

2. Test the API endpoints:
   ```bash
   # Get all packs (should now include color and image_url fields)
   curl http://localhost:8000/packs
   
   # Get vocab items (should now include image_url field)
   curl http://localhost:8000/vocab
   ```

### Frontend Testing
1. Make sure your backend is running
2. Start your frontend:
   ```bash
   cd aac-app/frontend
   npm start
   ```
3. Navigate to the student board
4. You should see:
   - Categories using colors from the database (if set)
   - An "OFFLINE" indicator if the API is unavailable
   - Images displayed on tiles (if image_url is set)

---

## Step 4: Adding Colors and Images

### Example: Update a pack's color via API
```bash
# Update the Math pack's color
curl -X PUT http://localhost:8000/packs/pack_default_math \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math",
    "subject": "Math",
    "color": "#4A90E2"
  }'
```

### Example: Add an image to a vocabulary item
```bash
# Update a vocab item with an image
curl -X PUT http://localhost:8000/vocab/vocab_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "pack_id": "pack_default_help",
    "label": "Help",
    "say": "I need help",
    "icon": "help-circle-outline",
    "image_url": "https://example.com/images/help-icon.png",
    "order": 0
  }'
```

### Example: Direct database update
```sql
-- Update a pack's color
UPDATE packs 
SET color = '#FF6B6B' 
WHERE id = 'pack_default_help';

-- Add an image to a pack
UPDATE packs 
SET image_url = 'https://example.com/images/help-folder.png' 
WHERE id = 'pack_default_help';

-- Add an image to a vocab item
UPDATE vocab_items 
SET image_url = 'https://example.com/images/toilet.png' 
WHERE label = 'Toilet';
```

---

## Offline Mode Behavior

The app now supports **offline mode**:
- On initial load, it tries to fetch data from the API
- If the API is unavailable, it uses the hardcoded `PACKS` data
- An "OFFLINE" indicator appears in the header when using hardcoded data
- This ensures students can still use the AAC board without internet

---

## Color Format

Colors should be in hex format:
- ✅ Valid: `#FF6B6B`, `#4A90E2`, `#D6F5D6`
- ❌ Invalid: `red`, `rgb(255,0,0)`

---

## Image URL Guidelines

1. **Use HTTPS URLs** for security
2. **Supported formats**: PNG, JPG, WebP, SVG
3. **Recommended size**: 200x200px to 400x400px
4. **Keep file sizes small** (< 100KB) for faster loading
5. **Use CDN or cloud storage** (e.g., AWS S3, Cloudinary)

Example URLs:
- `https://cdn.example.com/images/help.png`
- `https://storage.googleapis.com/bucket/vocab/toilet.jpg`

---

## Troubleshooting

### Colors not showing
- Verify the color column exists: `SELECT color FROM packs;`
- Check the color format is valid hex
- Restart the backend server
- Clear the frontend cache

### Images not displaying
- Verify the image_url column exists: `SELECT image_url FROM vocab_items;`
- Check the URL is accessible in a browser
- Ensure CORS is enabled for external images
- Check browser console for errors

### API not responding
- Check the backend is running on the correct port
- Verify `EXPO_PUBLIC_API_URL` environment variable in frontend
- Check for CORS issues in browser console
- The app should automatically switch to offline mode

---

## Next Steps

1. ✅ Run the migration
2. ✅ Test the API endpoints
3. ✅ Test the frontend
4. 🎨 Customize colors for your packs
5. 🖼️ Add images to vocabulary items
6. 📱 Test on mobile devices

---

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Remove the new columns
ALTER TABLE packs DROP COLUMN IF EXISTS color;
ALTER TABLE packs DROP COLUMN IF EXISTS image_url;
ALTER TABLE vocab_items DROP COLUMN IF EXISTS image_url;
```

Then revert the code changes to the previous version.
