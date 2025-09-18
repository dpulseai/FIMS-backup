/*
  # Fix foreign key relationship for school inspection forms

  1. Changes
    - Drop and recreate the foreign key constraint to ensure Supabase recognizes it
    - Add explicit foreign key constraint with proper naming
    - Refresh the relationship for PostgREST schema cache

  2. Security
    - No changes to RLS policies needed
*/

-- Drop the existing foreign key constraint if it exists
ALTER TABLE fims_school_inspection_forms 
DROP CONSTRAINT IF EXISTS fims_school_inspection_forms_inspection_id_fkey;

-- Recreate the foreign key constraint with explicit naming
ALTER TABLE fims_school_inspection_forms 
ADD CONSTRAINT fims_school_inspection_forms_inspection_id_fkey 
FOREIGN KEY (inspection_id) REFERENCES fims_inspections(id) ON DELETE CASCADE;

-- Ensure the column is properly indexed
CREATE INDEX IF NOT EXISTS idx_fims_school_inspection_forms_inspection_id 
ON fims_school_inspection_forms(inspection_id);

-- Force a schema refresh by updating table comment
COMMENT ON TABLE fims_school_inspection_forms IS 'School inspection forms with foreign key to fims_inspections';