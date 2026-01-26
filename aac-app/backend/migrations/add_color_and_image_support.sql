-- Migration: Add color and image_url support to packs and vocab_items tables
-- Date: 2026-01-27

-- Add color and image_url to packs table
ALTER TABLE packs ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE packs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add image_url to vocab_items table
ALTER TABLE vocab_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Optional: Set default colors for existing packs based on subject
UPDATE packs SET color = '#CFE8FF' WHERE subject = 'Math' AND color IS NULL;
UPDATE packs SET color = '#FFE2B8' WHERE subject = 'English' AND color IS NULL;
UPDATE packs SET color = '#FFC7C7' WHERE subject = 'General' AND color IS NULL;
UPDATE packs SET color = '#D6F5D6' WHERE color IS NULL;  -- Default for any others
