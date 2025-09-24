/*
  # Update Form 10 category for Pahuvaidhakiya Tapasani

  1. Category Update
    - Update Form 10 to be Pahuvaidhakiya Tapasani (Veterinary Institution Technical Inspection)
    - Set proper Marathi name and description
    - Mark as active

  2. Security
    - Uses existing RLS policies on fims_categories table
*/

-- Update Form 10 category to be Pahuvaidhakiya Tapasani
UPDATE fims_categories 
SET 
  name = 'Veterinary Institution Technical Inspection',
  name_marathi = 'पशुवैद्यकीय संस्थांचे तांत्रिक निरीक्षण',
  description = 'Technical inspection and evaluation of veterinary institutions including disease monitoring, vaccination programs, and livestock health services',
  is_active = true,
  updated_at = now()
WHERE form_type = 'form_10';

-- If the category doesn't exist, create it
INSERT INTO fims_categories (
  id,
  name, 
  name_marathi, 
  form_type, 
  description, 
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Veterinary Institution Technical Inspection', 
  'पशुवैद्यकीय संस्थांचे तांत्रिक निरीक्षण', 
  'form_10', 
  'Technical inspection and evaluation of veterinary institutions including disease monitoring, vaccination programs, and livestock health services', 
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM fims_categories WHERE form_type = 'form_10'
);

-- Verify the category was created/updated
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count 
  FROM fims_categories 
  WHERE form_type = 'form_10' AND is_active = true;
  
  IF category_count > 0 THEN
    RAISE NOTICE 'Verification: Form 10 (Pahuvaidhakiya Tapasani) category exists and is active';
  ELSE
    RAISE WARNING 'Verification failed: Form 10 category was not created/updated properly';
  END IF;
END $$;