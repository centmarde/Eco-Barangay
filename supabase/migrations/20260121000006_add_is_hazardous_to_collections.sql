-- Add is_hazardous column to collections table
ALTER TABLE "public"."collections" ADD COLUMN IF NOT EXISTS "is_hazardous" BOOLEAN DEFAULT FALSE;
