/*
  # Create veterinary_inspection_report_form table for Veterinary Institution Technical Inspection

  1. New Tables
    - `veterinary_inspection_report_form`
      - Complete veterinary inspection form data
      - Basic institution information
      - Technical work review and statistics
      - Patient and surgery statistics
      - Artificial insemination data
      - Born calves and pregnancy examination data
      - Disease information and vaccination program
      - Scheme progress tracking
      - Assessment and instructions

  2. Security
    - Enable RLS on the new table
    - Add policies for CRUD operations based on inspection ownership

  3. Indexes
    - Performance indexes on commonly queried fields
    - Foreign key index on inspection_id
*/

-- Create the veterinary_inspection_report_form table
CREATE TABLE IF NOT EXISTS veterinary_inspection_report_form (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inspection_id uuid NULL,
  institute_name_address text NOT NULL,
  head_name_contact text NOT NULL,
  inspector_name_designation text NOT NULL,
  visit_date_time text NOT NULL,
  inspection_purpose_reason text NOT NULL,
  technical_work_review text NOT NULL,
  work_type text NOT NULL,
  target_current_year text NOT NULL,
  achieved_month_end text NOT NULL,
  achieved_previous_year_month_end text NOT NULL,
  outpatients_target integer NOT NULL,
  outpatients_current_month integer NOT NULL,
  outpatients_previous integer NOT NULL,
  inpatients_target integer NOT NULL,
  inpatients_current_month integer NOT NULL,
  inpatients_previous integer NOT NULL,
  epilepsy_patients_target integer NOT NULL,
  epilepsy_patients_current_month integer NOT NULL,
  epilepsy_patients_previous integer NOT NULL,
  castration_headquarters_target integer NOT NULL,
  castration_headquarters_current_month integer NOT NULL,
  castration_headquarters_previous integer NOT NULL,
  castration_field_target integer NOT NULL,
  castration_field_current_month integer NOT NULL,
  castration_field_previous integer NOT NULL,
  major_surgery_headquarters_target integer NOT NULL,
  major_surgery_headquarters_current_month integer NOT NULL,
  major_surgery_headquarters_previous integer NOT NULL,
  major_surgery_field_target integer NOT NULL,
  major_surgery_field_current_month integer NOT NULL,
  major_surgery_field_previous integer NOT NULL,
  major_surgery_total_target integer NOT NULL,
  major_surgery_total_current_month integer NOT NULL,
  major_surgery_total_previous integer NOT NULL,
  minor_surgery_headquarters_target integer NOT NULL,
  minor_surgery_headquarters_current_month integer NOT NULL,
  minor_surgery_headquarters_previous integer NOT NULL,
  artificial_insemination_primary_foreign_target integer NOT NULL,
  artificial_insemination_primary_foreign_current_month integer NOT NULL,
  artificial_insemination_primary_foreign_previous integer NOT NULL,
  artificial_insemination_primary_hybrid_target integer NOT NULL,
  artificial_insemination_primary_hybrid_current_month integer NOT NULL,
  artificial_insemination_primary_hybrid_previous integer NOT NULL,
  artificial_insemination_primary_local_target integer NOT NULL,
  artificial_insemination_primary_local_current_month integer NOT NULL,
  artificial_insemination_primary_local_previous integer NOT NULL,
  artificial_insemination_primary_buffalo_target integer NOT NULL,
  artificial_insemination_primary_buffalo_current_month integer NOT NULL,
  artificial_insemination_primary_buffalo_previous integer NOT NULL,
  artificial_insemination_primary_total_target integer NOT NULL,
  artificial_insemination_primary_total_current_month integer NOT NULL,
  artificial_insemination_primary_total_previous integer NOT NULL,
  born_calves_cow_hybrid_target integer NOT NULL,
  born_calves_cow_hybrid_current_month integer NOT NULL,
  born_calves_cow_hybrid_previous integer NOT NULL,
  born_calves_cow_local_target integer NOT NULL,
  born_calves_cow_local_current_month integer NOT NULL,
  born_calves_cow_local_previous integer NOT NULL,
  born_calves_buffalo_target integer NOT NULL,
  born_calves_buffalo_current_month integer NOT NULL,
  born_calves_buffalo_previous integer NOT NULL,
  born_calves_total_target integer NOT NULL,
  born_calves_total_current_month integer NOT NULL,
  born_calves_total_previous integer NOT NULL,
  calved_cows_hybrid_target integer NOT NULL,
  calved_cows_hybrid_current_month integer NOT NULL,
  calved_cows_hybrid_previous integer NOT NULL,
  calved_cows_local_target integer NOT NULL,
  calved_cows_local_current_month integer NOT NULL,
  calved_cows_local_previous integer NOT NULL,
  calved_buffaloes_target integer NOT NULL,
  calved_buffaloes_current_month integer NOT NULL,
  calved_buffaloes_previous integer NOT NULL,
  pregnancy_examination_cow_target integer NOT NULL,
  pregnancy_examination_cow_current_month integer NOT NULL,
  pregnancy_examination_cow_previous integer NOT NULL,
  pregnancy_examination_buffalo_target integer NOT NULL,
  pregnancy_examination_buffalo_current_month integer NOT NULL,
  pregnancy_examination_buffalo_previous integer NOT NULL,
  pregnancy_examination_total_target integer NOT NULL,
  pregnancy_examination_total_current_month integer NOT NULL,
  pregnancy_examination_total_previous integer NOT NULL,
  infertility_animals_examination_cow_target integer NOT NULL,
  infertility_animals_examination_cow_current_month integer NOT NULL,
  infertility_animals_examination_cow_previous integer NOT NULL,
  infertility_animals_examination_buffalo_target integer NOT NULL,
  infertility_animals_examination_buffalo_current_month integer NOT NULL,
  infertility_animals_examination_buffalo_previous integer NOT NULL,
  infertility_animals_examination_total_target integer NOT NULL,
  infertility_animals_examination_total_current_month integer NOT NULL,
  infertility_animals_examination_total_previous integer NOT NULL,
  patients_average_daily_attendance_target integer NOT NULL,
  patients_average_daily_attendance_current_month integer NOT NULL,
  patients_average_daily_attendance_previous integer NOT NULL,
  collected_service_fees_target integer NOT NULL,
  collected_service_fees_current_month integer NOT NULL,
  collected_service_fees_previous integer NOT NULL,
  village_name character varying NOT NULL,
  disease_name character varying NOT NULL,
  incubation_period character varying NOT NULL,
  livestock_count integer NOT NULL,
  affected_count integer NOT NULL,
  deaths integer NOT NULL,
  vaccinated_count integer NOT NULL,
  actions_taken character varying NOT NULL,
  villages_within_10km integer NOT NULL,
  livestock_within_10km character varying NOT NULL,
  previous_endemic_disease_info character varying NOT NULL,
  edr_submission_date date NOT NULL,
  team_visit_date date NOT NULL,
  vaccine_type character varying NOT NULL,
  vaccine_name character varying NOT NULL,
  number_of_animals_in_program character varying NOT NULL,
  total_vaccinated character varying NOT NULL,
  recently_vaccinated_date character varying NOT NULL,
  received_vaccinated character varying NOT NULL,
  previous_vaccinated character varying NOT NULL,
  total_vaccinated_count character varying NOT NULL,
  vaccination_date character varying NOT NULL,
  since_april_vaccinated character varying NOT NULL,
  reason_not_vaccinated character varying NOT NULL,
  dairy_animals_group_distribution_target_current_year character varying NOT NULL,
  dairy_animals_group_distribution_achieved_current_year character varying NOT NULL,
  dairy_animals_group_distribution_achieved_previous_year character varying NOT NULL,
  dairy_animals_group_distribution_remarks character varying NOT NULL,
  goat_sheep_group_distribution_target_current_year character varying NOT NULL,
  goat_sheep_group_distribution_achieved_current_year character varying NOT NULL,
  goat_sheep_group_distribution_achieved_previous_year character varying NOT NULL,
  goat_sheep_group_distribution_remarks character varying NOT NULL,
  poultry_shed_construction_target_current_year character varying NOT NULL,
  poultry_shed_construction_achieved_current_year character varying NOT NULL,
  poultry_shed_construction_achieved_previous_year character varying NOT NULL,
  poultry_shed_construction_remarks character varying NOT NULL,
  pig_group_distribution_target_current_year character varying NOT NULL,
  pig_group_distribution_achieved_current_year character varying NOT NULL,
  pig_group_distribution_achieved_previous_year character varying NOT NULL,
  pig_group_distribution_remarks character varying NOT NULL,
  one_day_old_chicks_distribution_target_current_year character varying NOT NULL,
  one_day_old_chicks_distribution_achieved_current_year character varying NOT NULL,
  one_day_old_chicks_distribution_achieved_previous_year character varying NOT NULL,
  one_day_old_chicks_distribution_remarks character varying NOT NULL,
  double_yolk_eggs_distribution_target_current_year character varying NOT NULL,
  double_yolk_eggs_distribution_achieved_current_year character varying NOT NULL,
  double_yolk_eggs_distribution_achieved_previous_year character varying NOT NULL,
  double_yolk_eggs_distribution_remarks character varying NOT NULL,
  general_technical_assessment character varying NOT NULL,
  given_instructions character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT veterinary_inspection_report_form_pkey PRIMARY KEY (id),
  CONSTRAINT veterinary_inspection_report_form_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES fims_inspections (id) ON DELETE CASCADE
);

-- Enable RLS on the new table
ALTER TABLE veterinary_inspection_report_form ENABLE ROW LEVEL SECURITY;

-- Create policies for veterinary_inspection_report_form
CREATE POLICY "Users can read own veterinary inspection forms"
  ON veterinary_inspection_report_form
  FOR SELECT
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own veterinary inspection forms"
  ON veterinary_inspection_report_form
  FOR INSERT
  TO authenticated
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own veterinary inspection forms"
  ON veterinary_inspection_report_form
  FOR UPDATE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own veterinary inspection forms"
  ON veterinary_inspection_report_form
  FOR DELETE
  TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM fims_inspections WHERE inspector_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_veterinary_inspection_report_form_inspection_id 
  ON veterinary_inspection_report_form(inspection_id);

CREATE INDEX IF NOT EXISTS idx_veterinary_inspection_report_form_created_at 
  ON veterinary_inspection_report_form(created_at);

CREATE INDEX IF NOT EXISTS idx_veterinary_inspection_report_form_institute_name 
  ON veterinary_inspection_report_form(institute_name_address);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_veterinary_inspection_report_form_updated_at 
  BEFORE UPDATE ON veterinary_inspection_report_form 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();