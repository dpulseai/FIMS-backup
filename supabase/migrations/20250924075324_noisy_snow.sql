/*
  # Create pahuvaidhakiya_tapasani table for Veterinary Institution Technical Inspection Form

  1. New Tables
    - `pahuvaidhakiya_tapasani`
      - Basic institution information
      - Inspector details
      - Technical work overview data
      - Disease information and outbreak details
      - Vaccination program data
      - Scheme progress information
      - General technical evaluation
      - Instructions given

  2. Security
    - Enable RLS on the new table
    - Add policies for CRUD operations based on inspection ownership

  3. Indexes
    - Performance indexes on commonly queried fields
    - Foreign key index on inspection_id
*/

-- Create the pahuvaidhakiya_tapasani table
CREATE TABLE IF NOT EXISTS pahuvaidhakiya_tap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES fims_inspections(id) ON DELETE CASCADE,
  
  -- Basic institution information
  institution_name text,
  institution_address text,
  institution_category text, -- श्रेणी-1 / श्रेणी-2 / फिरते पवैद्य
  head_name text,
  head_contact text,
  inspector_name text,
  inspector_designation text,
  visit_date text,
  visit_time text,
  inspection_purpose text,
  
  -- Technical work overview data (JSON to store table data)
  technical_work_data jsonb DEFAULT '{}',
  
  -- Disease information
  village_name text,
  disease_name text,
  outbreak_period text,
  livestock_count text,
  infection_count text,
  death_count text,
  vaccination_done text,
  action_taken text,
  villages_10km_count text,
  livestock_10km_area text,
  previous_outbreak_info text,
  edr_submission_date text,
  team_visit_dates text,
  
  -- Vaccination program data (JSON to store table data)
  vaccination_program_data jsonb DEFAULT '{}',
  
  -- Scheme progress
  scheme_progress text,
  
  -- General technical evaluation
  general_evaluation text,
  
  -- Instructions given
  instructions_given text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE pahuvaidhakiya_tapasani ENABLE ROW LEVEL SECURITY;

-- Create policies for pahuvaidhakiya_tapasani
CREATE POLICY "Users can read own pahuvaidhakiya forms"
  ON pahuvaidhakiya_tapasani
  FOR SELECT
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pahuvaidhakiya forms"
  ON pahuvaidhakiya_tapasani
  FOR INSERT
  TO authenticated
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own pahuvaidhakiya forms"
  ON pahuvaidhakiya_tapasani
  FOR UPDATE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own pahuvaidhakiya forms"
  ON pahuvaidhakiya_tapasani
  FOR DELETE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pahuvaidhakiya_tapasani_inspection_id 
  ON pahuvaidhakiya_tapasani(inspection_id);

CREATE INDEX IF NOT EXISTS idx_pahuvaidhakiya_tapasani_created_at 
  ON pahuvaidhakiya_tapasani(created_at);

CREATE INDEX IF NOT EXISTS idx_pahuvaidhakiya_tapasani_institution_name 
  ON pahuvaidhakiya_tapasani(institution_name);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pahuvaidhakiya_tapasani_updated_at 
  BEFORE UPDATE ON pahuvaidhakiya_tapasani 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();