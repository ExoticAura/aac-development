-- Migration: Add color column to packs table
-- Date: 2026-01-27

ALTER TABLE packs ADD COLUMN color VARCHAR(20);

-- Set default colors for existing packs
UPDATE packs SET color = '#B3E5FC' WHERE id = 'pack_default_help';
UPDATE packs SET color = '#42A5F5' WHERE id = 'pack_default_Math';
