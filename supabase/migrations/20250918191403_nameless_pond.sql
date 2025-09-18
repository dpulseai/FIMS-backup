/*
  # Create adarsh_shala table for Rajya Shaishanik Prashikshan form data

  1. New Tables
    - `adarsh_shala`
      - All fields from Rajya Shaishanik form
      - Basic school information
      - Teacher and student data
      - Khan Academy information
      - SQDP and educational assessment data
      - Officer feedback and recommendations
      - Inspector information

  2. Security
    - Enable RLS on the new table
    - Add policies for CRUD operations based on inspection ownership

  3. Indexes
    - Performance indexes on commonly queried fields
    - Foreign key index on inspection_id
*/

-- Create the adarsh_shala table with all fields from Rajya Shaishanik form
CREATE TABLE IF NOT EXISTS adarsh_shala (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NULL,
  
  -- Basic school information
  visit_date text,
  school_name text,
  school_address text,
  principal_name text,
  principal_mobile text,
  udise_number text,
  center_name text,
  taluka_name text,
  district_name text,
  management_type text,
  school_achievement_self text,
  school_achievement_external text,
  
  -- Teacher information
  sanctioned_posts integer DEFAULT 0,
  working_posts integer DEFAULT 0,
  present_teachers integer DEFAULT 0,
  
  -- Class-wise enrollment data
  class_1_boys integer DEFAULT 0,
  class_1_girls integer DEFAULT 0,
  class_1_total integer DEFAULT 0,
  class_2_boys integer DEFAULT 0,
  class_2_girls integer DEFAULT 0,
  class_2_total integer DEFAULT 0,
  class_3_boys integer DEFAULT 0,
  class_3_girls integer DEFAULT 0,
  class_3_total integer DEFAULT 0,
  class_4_boys integer DEFAULT 0,
  class_4_girls integer DEFAULT 0,
  class_4_total integer DEFAULT 0,
  class_5_boys integer DEFAULT 0,
  class_5_girls integer DEFAULT 0,
  class_5_total integer DEFAULT 0,
  class_6_boys integer DEFAULT 0,
  class_6_girls integer DEFAULT 0,
  class_6_total integer DEFAULT 0,
  class_7_boys integer DEFAULT 0,
  class_7_girls integer DEFAULT 0,
  class_7_total integer DEFAULT 0,
  class_8_boys integer DEFAULT 0,
  class_8_girls integer DEFAULT 0,
  class_8_total integer DEFAULT 0,
  total_boys integer DEFAULT 0,
  total_girls integer DEFAULT 0,
  total_students integer DEFAULT 0,
  
  -- Khan Academy information
  math_teachers_count integer DEFAULT 0,
  khan_registered_teachers integer DEFAULT 0,
  khan_registered_students integer DEFAULT 0,
  khan_active_students integer DEFAULT 0,
  khan_usage_method text,
  
  -- SQDP information
  sqdp_prepared text,
  sqdp_objectives_achieved text,
  
  -- Nipun Bharat verification
  nipun_bharat_verification text,
  
  -- Learning outcomes assessment
  learning_outcomes_assessment text,
  
  -- Learning outcomes by subject and class
  marathi_class_1 text,
  marathi_class_2 text,
  marathi_class_3 text,
  marathi_class_4 text,
  marathi_class_5 text,
  marathi_class_6 text,
  marathi_class_7 text,
  marathi_class_8 text,
  
  english_class_1 text,
  english_class_2 text,
  english_class_3 text,
  english_class_4 text,
  english_class_5 text,
  english_class_6 text,
  english_class_7 text,
  english_class_8 text,
  
  math_class_1 text,
  math_class_2 text,
  math_class_3 text,
  math_class_4 text,
  math_class_5 text,
  math_class_6 text,
  math_class_7 text,
  math_class_8 text,
  
  science_class_1 text,
  science_class_2 text,
  science_class_3 text,
  science_class_4 text,
  science_class_5 text,
  science_class_6 text,
  science_class_7 text,
  science_class_8 text,
  
  social_studies_class_1 text,
  social_studies_class_2 text,
  social_studies_class_3 text,
  social_studies_class_4 text,
  social_studies_class_5 text,
  social_studies_class_6 text,
  social_studies_class_7 text,
  social_studies_class_8 text,
  
  -- Materials and technology usage
  textbooks_usage text,
  workbooks_usage text,
  library_books_usage text,
  digital_content_usage text,
  smart_board_usage text,
  computer_lab_usage text,
  science_lab_usage text,
  sports_equipment_usage text,
  
  -- Officer feedback
  officer_feedback text,
  innovative_initiatives text,
  suggested_changes text,
  srujanrang_articles text,
  future_articles text,
  ngo_involvement text,
  
  -- Inspector information
  inspector_name text,
  inspector_designation text,
  visit_date_inspector text,
  inspection_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT adarsh_shala_pkey PRIMARY KEY (id),
  CONSTRAINT adarsh_shala_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES fims_inspections (id) ON DELETE CASCADE
);

-- Enable RLS on the new table
ALTER TABLE adarsh_shala ENABLE ROW LEVEL SECURITY;

-- Create policies for adarsh_shala
CREATE POLICY "Users can read own adarsh_shala forms"
  ON adarsh_shala
  FOR SELECT
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own adarsh_shala forms"
  ON adarsh_shala
  FOR INSERT
  TO authenticated
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own adarsh_shala forms"
  ON adarsh_shala
  FOR UPDATE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own adarsh_shala forms"
  ON adarsh_shala
  FOR DELETE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adarsh_shala_district ON adarsh_shala USING btree (district_name);
CREATE INDEX IF NOT EXISTS idx_adarsh_shala_taluka ON adarsh_shala USING btree (taluka_name);
CREATE INDEX IF NOT EXISTS idx_adarsh_shala ON adarsh_shala USING btree (school_name);
CREATE INDEX IF NOT EXISTS idx_adarsh_shala_date ON adarsh_shala USING btree (inspection_date);
CREATE INDEX IF NOT EXISTS idx_adarsh_shala_created_at ON adarsh_shala USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_adarsh_shala_inspection_id ON adarsh_shala USING btree (inspection_id);

-- Create trigger for updated_at
CREATE TRIGGER update_adarsh_shala_updated_at 
  BEFORE UPDATE ON adarsh_shala 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();