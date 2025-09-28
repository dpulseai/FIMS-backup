import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Camera, Save, Send, Building, FileText, Calendar, User, Users, Activity, Heart, Syringe, BarChart3, TriangleAlert as AlertTriangle, ClipboardList, Target, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PahuvaidhakiyaTapasaniFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface VeterinaryInspectionFormData {
  // Basic institution information
  institute_name_address: string;
  head_name_contact: string;
  inspector_name_designation: string;
  visit_date_time: string;
  inspection_purpose_reason: string;
  
  // Technical work review
  technical_work_review: string;
  work_type: string;
  target_current_year: string;
  achieved_month_end: string;
  achieved_previous_year_month_end: string;
  
  // Patient statistics
  outpatients_target: number;
  outpatients_current_month: number;
  outpatients_previous: number;
  inpatients_target: number;
  inpatients_current_month: number;
  inpatients_previous: number;
  epilepsy_patients_target: number;
  epilepsy_patients_current_month: number;
  epilepsy_patients_previous: number;
  
  // Surgery statistics
  castration_headquarters_target: number;
  castration_headquarters_current_month: number;
  castration_headquarters_previous: number;
  castration_field_target: number;
  castration_field_current_month: number;
  castration_field_previous: number;
  major_surgery_headquarters_target: number;
  major_surgery_headquarters_current_month: number;
  major_surgery_headquarters_previous: number;
  major_surgery_field_target: number;
  major_surgery_field_current_month: number;
  major_surgery_field_previous: number;
  major_surgery_total_target: number;
  major_surgery_total_current_month: number;
  major_surgery_total_previous: number;
  minor_surgery_headquarters_target: number;
  minor_surgery_headquarters_current_month: number;
  minor_surgery_headquarters_previous: number;
  
  // Artificial insemination statistics
  artificial_insemination_primary_foreign_target: number;
  artificial_insemination_primary_foreign_current_month: number;
  artificial_insemination_primary_foreign_previous: number;
  artificial_insemination_primary_hybrid_target: number;
  artificial_insemination_primary_hybrid_current_month: number;
  artificial_insemination_primary_hybrid_previous: number;
  artificial_insemination_primary_local_target: number;
  artificial_insemination_primary_local_current_month: number;
  artificial_insemination_primary_local_previous: number;
  artificial_insemination_primary_buffalo_target: number;
  artificial_insemination_primary_buffalo_current_month: number;
  artificial_insemination_primary_buffalo_previous: number;
  artificial_insemination_primary_total_target: number;
  artificial_insemination_primary_total_current_month: number;
  artificial_insemination_primary_total_previous: number;
  
  // Born calves statistics
  born_calves_cow_hybrid_target: number;
  born_calves_cow_hybrid_current_month: number;
  born_calves_cow_hybrid_previous: number;
  born_calves_cow_local_target: number;
  born_calves_cow_local_current_month: number;
  born_calves_cow_local_previous: number;
  born_calves_buffalo_target: number;
  born_calves_buffalo_current_month: number;
  born_calves_buffalo_previous: number;
  born_calves_total_target: number;
  born_calves_total_current_month: number;
  born_calves_total_previous: number;
  
  // Calved animals statistics
  calved_cows_hybrid_target: number;
  calved_cows_hybrid_current_month: number;
  calved_cows_hybrid_previous: number;
  calved_cows_local_target: number;
  calved_cows_local_current_month: number;
  calved_cows_local_previous: number;
  calved_buffaloes_target: number;
  calved_buffaloes_current_month: number;
  calved_buffaloes_previous: number;
  
  // Pregnancy examination statistics
  pregnancy_examination_cow_target: number;
  pregnancy_examination_cow_current_month: number;
  pregnancy_examination_cow_previous: number;
  pregnancy_examination_buffalo_target: number;
  pregnancy_examination_buffalo_current_month: number;
  pregnancy_examination_buffalo_previous: number;
  pregnancy_examination_total_target: number;
  pregnancy_examination_total_current_month: number;
  pregnancy_examination_total_previous: number;
  
  // Infertility examination statistics
  infertility_animals_examination_cow_target: number;
  infertility_animals_examination_cow_current_month: number;
  infertility_animals_examination_cow_previous: number;
  infertility_animals_examination_buffalo_target: number;
  infertility_animals_examination_buffalo_current_month: number;
  infertility_animals_examination_buffalo_previous: number;
  infertility_animals_examination_total_target: number;
  infertility_animals_examination_total_current_month: number;
  infertility_animals_examination_total_previous: number;
  
  // Other statistics
  patients_average_daily_attendance_target: number;
  patients_average_daily_attendance_current_month: number;
  patients_average_daily_attendance_previous: number;
  collected_service_fees_target: number;
  collected_service_fees_current_month: number;
  collected_service_fees_previous: number;
  
  // Disease information
  village_name: string;
  disease_name: string;
  incubation_period: string;
  livestock_count: number;
  affected_count: number;
  deaths: number;
  vaccinated_count: number;
  actions_taken: string;
  villages_within_10km: number;
  livestock_within_10km: string;
  previous_endemic_disease_info: string;
  edr_submission_date: string;
  team_visit_date: string;
  
  // Vaccination program data
  vaccine_type: string;
  vaccine_name: string;
  number_of_animals_in_program: string;
  total_vaccinated: string;
  recently_vaccinated_date: string;
  received_vaccinated: string;
  previous_vaccinated: string;
  total_vaccinated_count: string;
  vaccination_date: string;
  since_april_vaccinated: string;
  reason_not_vaccinated: string;
  
  // Scheme progress data
  dairy_animals_group_distribution_target_current_year: string;
  dairy_animals_group_distribution_achieved_current_year: string;
  dairy_animals_group_distribution_achieved_previous_year: string;
  dairy_animals_group_distribution_remarks: string;
  goat_sheep_group_distribution_target_current_year: string;
  goat_sheep_group_distribution_achieved_current_year: string;
  goat_sheep_group_distribution_achieved_previous_year: string;
  goat_sheep_group_distribution_remarks: string;
  poultry_shed_construction_target_current_year: string;
  poultry_shed_construction_achieved_current_year: string;
  poultry_shed_construction_achieved_previous_year: string;
  poultry_shed_construction_remarks: string;
  pig_group_distribution_target_current_year: string;
  pig_group_distribution_achieved_current_year: string;
  pig_group_distribution_achieved_previous_year: string;
  pig_group_distribution_remarks: string;
  one_day_old_chicks_distribution_target_current_year: string;
  one_day_old_chicks_distribution_achieved_current_year: string;
  one_day_old_chicks_distribution_achieved_previous_year: string;
  one_day_old_chicks_distribution_remarks: string;
  double_yolk_eggs_distribution_target_current_year: string;
  double_yolk_eggs_distribution_achieved_current_year: string;
  double_yolk_eggs_distribution_achieved_previous_year: string;
  double_yolk_eggs_distribution_remarks: string;
  
  // Assessment and instructions
  general_technical_assessment: string;
  given_instructions: string;
}

export const PahuvaidhakiyaTapasaniForm: React.FC<PahuvaidhakiyaTapasaniFormProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Check if we're in view mode
  const isViewMode = editingInspection?.mode === 'view';
  const isEditMode = editingInspection?.mode === 'edit';

  // Basic inspection data
  const [inspectionData, setInspectionData] = useState({
    category_id: '',
    location_name: '',
    address: '',
    planned_date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    location_accuracy: null as number | null
  });

  // Veterinary inspection form data
  const [veterinaryFormData, setVeterinaryFormData] = useState<VeterinaryInspectionFormData>({
    institute_name_address: '',
    head_name_contact: '',
    inspector_name_designation: '',
    visit_date_time: '',
    inspection_purpose_reason: '',
    technical_work_review: '',
    work_type: '',
    target_current_year: '',
    achieved_month_end: '',
    achieved_previous_year_month_end: '',
    outpatients_target: 0,
    outpatients_current_month: 0,
    outpatients_previous: 0,
    inpatients_target: 0,
    inpatients_current_month: 0,
    inpatients_previous: 0,
    epilepsy_patients_target: 0,
    epilepsy_patients_current_month: 0,
    epilepsy_patients_previous: 0,
    castration_headquarters_target: 0,
    castration_headquarters_current_month: 0,
    castration_headquarters_previous: 0,
    castration_field_target: 0,
    castration_field_current_month: 0,
    castration_field_previous: 0,
    major_surgery_headquarters_target: 0,
    major_surgery_headquarters_current_month: 0,
    major_surgery_headquarters_previous: 0,
    major_surgery_field_target: 0,
    major_surgery_field_current_month: 0,
    major_surgery_field_previous: 0,
    major_surgery_total_target: 0,
    major_surgery_total_current_month: 0,
    major_surgery_total_previous: 0,
    minor_surgery_headquarters_target: 0,
    minor_surgery_headquarters_current_month: 0,
    minor_surgery_headquarters_previous: 0,
    artificial_insemination_primary_foreign_target: 0,
    artificial_insemination_primary_foreign_current_month: 0,
    artificial_insemination_primary_foreign_previous: 0,
    artificial_insemination_primary_hybrid_target: 0,
    artificial_insemination_primary_hybrid_current_month: 0,
    artificial_insemination_primary_hybrid_previous: 0,
    artificial_insemination_primary_local_target: 0,
    artificial_insemination_primary_local_current_month: 0,
    artificial_insemination_primary_local_previous: 0,
    artificial_insemination_primary_buffalo_target: 0,
    artificial_insemination_primary_buffalo_current_month: 0,
    artificial_insemination_primary_buffalo_previous: 0,
    artificial_insemination_primary_total_target: 0,
    artificial_insemination_primary_total_current_month: 0,
    artificial_insemination_primary_total_previous: 0,
    born_calves_cow_hybrid_target: 0,
    born_calves_cow_hybrid_current_month: 0,
    born_calves_cow_hybrid_previous: 0,
    born_calves_cow_local_target: 0,
    born_calves_cow_local_current_month: 0,
    born_calves_cow_local_previous: 0,
    born_calves_buffalo_target: 0,
    born_calves_buffalo_current_month: 0,
    born_calves_buffalo_previous: 0,
    born_calves_total_target: 0,
    born_calves_total_current_month: 0,
    born_calves_total_previous: 0,
    calved_cows_hybrid_target: 0,
    calved_cows_hybrid_current_month: 0,
    calved_cows_hybrid_previous: 0,
    calved_cows_local_target: 0,
    calved_cows_local_current_month: 0,
    calved_cows_local_previous: 0,
    calved_buffaloes_target: 0,
    calved_buffaloes_current_month: 0,
    calved_buffaloes_previous: 0,
    pregnancy_examination_cow_target: 0,
    pregnancy_examination_cow_current_month: 0,
    pregnancy_examination_cow_previous: 0,
    pregnancy_examination_buffalo_target: 0,
    pregnancy_examination_buffalo_current_month: 0,
    pregnancy_examination_buffalo_previous: 0,
    pregnancy_examination_total_target: 0,
    pregnancy_examination_total_current_month: 0,
    pregnancy_examination_total_previous: 0,
    infertility_animals_examination_cow_target: 0,
    infertility_animals_examination_cow_current_month: 0,
    infertility_animals_examination_cow_previous: 0,
    infertility_animals_examination_buffalo_target: 0,
    infertility_animals_examination_buffalo_current_month: 0,
    infertility_animals_examination_buffalo_previous: 0,
    infertility_animals_examination_total_target: 0,
    infertility_animals_examination_total_current_month: 0,
    infertility_animals_examination_total_previous: 0,
    patients_average_daily_attendance_target: 0,
    patients_average_daily_attendance_current_month: 0,
    patients_average_daily_attendance_previous: 0,
    collected_service_fees_target: 0,
    collected_service_fees_current_month: 0,
    collected_service_fees_previous: 0,
    
    // Disease information
    village_name: '',
    disease_name: '',
    incubation_period: '',
    livestock_count: 0,
    affected_count: 0,
    deaths: 0,
    vaccinated_count: 0,
    actions_taken: '',
    villages_within_10km: 0,
    livestock_within_10km: '',
    previous_endemic_disease_info: '',
    edr_submission_date: '',
    team_visit_date: '',
    
    // Vaccination program data
    vaccine_type: '',
    vaccine_name: '',
    number_of_animals_in_program: '',
    total_vaccinated: '',
    recently_vaccinated_date: '',
    received_vaccinated: '',
    previous_vaccinated: '',
    total_vaccinated_count: '',
    vaccination_date: '',
    since_april_vaccinated: '',
    reason_not_vaccinated: '',
    
    // Scheme progress data
    dairy_animals_group_distribution_target_current_year: '',
    dairy_animals_group_distribution_achieved_current_year: '',
    dairy_animals_group_distribution_achieved_previous_year: '',
    dairy_animals_group_distribution_remarks: '',
    goat_sheep_group_distribution_target_current_year: '',
    goat_sheep_group_distribution_achieved_current_year: '',
    goat_sheep_group_distribution_achieved_previous_year: '',
    goat_sheep_group_distribution_remarks: '',
    poultry_shed_construction_target_current_year: '',
    poultry_shed_construction_achieved_current_year: '',
    poultry_shed_construction_achieved_previous_year: '',
    poultry_shed_construction_remarks: '',
    pig_group_distribution_target_current_year: '',
    pig_group_distribution_achieved_current_year: '',
    pig_group_distribution_achieved_previous_year: '',
    pig_group_distribution_remarks: '',
    one_day_old_chicks_distribution_target_current_year: '',
    one_day_old_chicks_distribution_achieved_current_year: '',
    one_day_old_chicks_distribution_achieved_previous_year: '',
    one_day_old_chicks_distribution_remarks: '',
    double_yolk_eggs_distribution_target_current_year: '',
    double_yolk_eggs_distribution_achieved_current_year: '',
    double_yolk_eggs_distribution_achieved_previous_year: '',
    double_yolk_eggs_distribution_remarks: '',
    
    // Assessment and instructions
    general_technical_assessment: '',
    given_instructions: ''
  });

  // Get veterinary category
  const veterinaryCategory = categories.find(cat => cat.form_type === 'pashutapasani');

  useEffect(() => {
    if (veterinaryCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: veterinaryCategory.id
      }));
    }
  }, [veterinaryCategory]);

  // Load existing inspection data when editing
  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      // Load basic inspection data
      setInspectionData({
        category_id: editingInspection.category_id || '',
        location_name: editingInspection.location_name || '',
        address: editingInspection.address || '',
        planned_date: editingInspection.planned_date ? editingInspection.planned_date.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        location_accuracy: editingInspection.location_accuracy
      });

      // Load form data if it exists
      if (editingInspection.form_data) {
        setVeterinaryFormData({
          ...veterinaryFormData,
          ...editingInspection.form_data
        });
      }
    }
  }, [editingInspection]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('fims.geolocationNotSupported'));
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setInspectionData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy: position.coords.accuracy
        }));
        
        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const locationName = data.results[0].formatted_address;
            setInspectionData(prev => ({
              ...prev,
              address: locationName
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('fims.unableToGetLocation'));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedPhotos.length + files.length > 5) {
      alert(t('fims.maxPhotosAllowed'));
      return;
    }

    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `veterinary_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('field-visit-images')
          .getPublicUrl(fileName);

        // Save photo record to database
        const { error: dbError } = await supabase
          .from('fims_inspection_photos')
          .insert({
            inspection_id: inspectionId,
            photo_url: publicUrl,
            photo_name: file.name,
            description: `पशुवैद्यकीय तपासणी फोटो ${i + 1}`,
            photo_order: i + 1
          });

        if (dbError) throw dbError;
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `VET-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      // Convert empty date strings to null for database compatibility
      const sanitizedInspectionData = {
        ...inspectionData,
        planned_date: inspectionData.planned_date || null
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            location_name: sanitizedInspectionData.location_name,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            address: sanitizedInspectionData.address,
            planned_date: sanitizedInspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: veterinaryFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert veterinary_inspection_report_form record
        const { error: formError } = await supabase
          .from('veterinary_inspection_report_form')
          .upsert({
            inspection_id: editingInspection.id,
            ...veterinaryFormData
          });

        if (formError) throw formError;
      } else {
        // Create new inspection
        const inspectionNumber = generateInspectionNumber();

        const { data: createResult, error: createError } = await supabase
          .from('fims_inspections')
          .insert({
            inspection_number: inspectionNumber,
            category_id: sanitizedInspectionData.category_id,
            inspector_id: user.id,
            location_name: sanitizedInspectionData.location_name,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            location_accuracy: sanitizedInspectionData.location_accuracy,
            address: sanitizedInspectionData.address,
            planned_date: sanitizedInspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: veterinaryFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create veterinary_inspection_report_form record
        const { error: formError } = await supabase
          .from('veterinary_inspection_report_form')
          .insert({
            inspection_id: inspectionResult.id,
            ...veterinaryFormData
          });

        if (formError) throw formError;
      }

      // Upload photos if any
      if (uploadedPhotos.length > 0) {
        await uploadPhotosToSupabase(inspectionResult.id);
      }

      const isUpdate = editingInspection && editingInspection.id;
      const message = isDraft 
        ? (isUpdate ? t('fims.inspectionUpdatedAsDraft') : t('fims.inspectionSavedAsDraft'))
        : (isUpdate ? t('fims.inspectionUpdatedSuccessfully') : t('fims.inspectionSubmittedSuccessfully'));
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error saving inspection: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 7 && (
            <div className={`w-12 h-1 mx-1 ${
              currentStep > step ? 'bg-red-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2 text-red-600" />
        संस्थेची मूलभूत माहिती (Basic Institution Information)
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संस्थेचे नाव व पत्ता *
          </label>
          <textarea
            value={veterinaryFormData.institute_name_address}
            onChange={(e) => setVeterinaryFormData(prev => ({...prev, institute_name_address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="संस्थेचे संपूर्ण नाव व पत्ता प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            प्रमुखाचे नाव व संपर्क *
          </label>
          <input
            type="text"
            value={veterinaryFormData.head_name_contact}
            onChange={(e) => setVeterinaryFormData(prev => ({...prev, head_name_contact: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="प्रमुखाचे नाव व मोबाइल नंबर प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            निरीक्षकाचे नाव व पदनाम *
          </label>
          <input
            type="text"
            value={veterinaryFormData.inspector_name_designation}
            onChange={(e) => setVeterinaryFormData(prev => ({...prev, inspector_name_designation: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="निरीक्षकाचे नाव व पदनाम प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              भेट दिनांक व वेळ *
            </label>
            <input
              type="datetime-local"
              value={veterinaryFormData.visit_date_time}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, visit_date_time: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              तपासणीचा उद्देश *
            </label>
            <select
              value={veterinaryFormData.inspection_purpose_reason}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, inspection_purpose_reason: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              disabled={isViewMode}
            >
              <option value="">तपासणीचा उद्देश निवडा</option>
              <option value="नियमित तपासणी">नियमित तपासणी</option>
              <option value="रोग तपासणी">रोग तपासणी</option>
              <option value="लसीकरण कार्यक्रम">लसीकरण कार्यक्रम</option>
              <option value="तक्रार तपासणी">तक्रार तपासणी</option>
              <option value="इतर">इतर</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          स्थान माहिती (Location Information)
        </h3>
      </div>
      
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            स्थानाचे नाव *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="स्थानाचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              नियोजित तारीख
            </label>
            <input
              type="date"
              value={inspectionData.planned_date}
              onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Location
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading || isViewMode}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              <span>{isLoading ? 'स्थान मिळवत आहे...' : 'सध्याचे स्थान मिळवा'}</span>
            </button>
          </div>
        </div>

        {inspectionData.latitude && inspectionData.longitude && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">स्थान कॅप्चर केले</p>
            <div className="text-xs text-green-600 space-y-1">
              <p>अक्षांश: {inspectionData.latitude.toFixed(6)}</p>
              <p>रेखांश: {inspectionData.longitude.toFixed(6)}</p>
              <p>अचूकता: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संपूर्ण पत्ता
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderTechnicalWorkReview = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        तांत्रिक कामाचा आढावा (Technical Work Review)
      </h3>

      {/* Technical Work Overview */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-red-600" />
          कामाचा आढावा (Work Overview)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              तांत्रिक कामाचा आढावा
            </label>
            <textarea
              value={veterinaryFormData.technical_work_review}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, technical_work_review: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="तांत्रिक कामाचा तपशीलवार आढावा प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कामाचा प्रकार
              </label>
              <input
                type="text"
                value={veterinaryFormData.work_type}
                onChange={(e) => setVeterinaryFormData(prev => ({...prev, work_type: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="कामाचा प्रकार प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                चालू वर्षाचे लक्ष्य
              </label>
              <input
                type="text"
                value={veterinaryFormData.target_current_year}
                onChange={(e) => setVeterinaryFormData(prev => ({...prev, target_current_year: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                महिना अखेरपर्यंत साध्य
              </label>
              <input
                type="text"
                value={veterinaryFormData.achieved_month_end}
                onChange={(e) => setVeterinaryFormData(prev => ({...prev, achieved_month_end: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="महिना अखेरपर्यंत साध्य केलेले प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मागील वर्षी महिना अखेरपर्यंत साध्य
              </label>
              <input
                type="text"
                value={veterinaryFormData.achieved_previous_year_month_end}
                onChange={(e) => setVeterinaryFormData(prev => ({...prev, achieved_previous_year_month_end: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="मागील वर्षी साध्य केलेले प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatientStatistics = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        रुग्ण आकडेवारी (Patient Statistics)
      </h3>

      {/* Patient Statistics Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" />
          रुग्ण संख्या तपशील (Patient Count Details)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">रुग्ण प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">बाह्यरुग्ण (Outpatients)</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.outpatients_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, outpatients_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.outpatients_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, outpatients_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.outpatients_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, outpatients_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">अंतर्रुग्ण (Inpatients)</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.inpatients_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, inpatients_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.inpatients_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, inpatients_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.inpatients_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, inpatients_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">अपस्मार रुग्ण (Epilepsy Patients)</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.epilepsy_patients_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, epilepsy_patients_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.epilepsy_patients_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, epilepsy_patients_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.epilepsy_patients_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, epilepsy_patients_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSurgeryStatistics = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        शस्त्रक्रिया आकडेवारी (Surgery Statistics)
      </h3>

      {/* Surgery Statistics Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-red-600" />
          शस्त्रक्रिया तपशील (Surgery Details)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">शस्त्रक्रिया प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">नपुंसकीकरण - मुख्यालय</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_headquarters_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_headquarters_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_headquarters_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_headquarters_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_headquarters_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_headquarters_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">नपुंसकीकरण - शेत</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_field_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_field_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_field_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_field_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.castration_field_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, castration_field_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">मोठी शस्त्रक्रिया - मुख्यालय</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_headquarters_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_headquarters_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_headquarters_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_headquarters_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_headquarters_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_headquarters_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">मोठी शस्त्रक्रिया - शेत</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_field_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_field_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_field_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_field_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_field_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_field_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">मोठी शस्त्रक्रिया - एकूण</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_total_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_total_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_total_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_total_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.major_surgery_total_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, major_surgery_total_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">छोटी शस्त्रक्रिया - मुख्यालय</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.minor_surgery_headquarters_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, minor_surgery_headquarters_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.minor_surgery_headquarters_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, minor_surgery_headquarters_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.minor_surgery_headquarters_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, minor_surgery_headquarters_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderArtificialInseminationStatistics = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        कृत्रिम रेतन आकडेवारी (Artificial Insemination Statistics)
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-red-600" />
          कृत्रिम रेतन तपशील (Artificial Insemination Details)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">रेतन प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">प्राथमिक - विदेशी</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_foreign_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_foreign_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_foreign_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_foreign_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_foreign_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_foreign_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">प्राथमिक - संकरित</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_hybrid_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_hybrid_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_hybrid_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_hybrid_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_hybrid_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_hybrid_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">प्राथमिक - स्थानिक</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_local_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_local_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_local_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_local_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_local_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_local_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">प्राथमिक - म्हैस</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_buffalo_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_buffalo_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_buffalo_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_buffalo_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_buffalo_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_buffalo_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-bold">प्राथमिक - एकूण</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_total_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_total_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_total_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_total_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.artificial_insemination_primary_total_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, artificial_insemination_primary_total_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBornCalvesStatistics = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        जन्मलेली वासरे आकडेवारी (Born Calves Statistics)
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" />
          जन्मलेली वासरे तपशील (Born Calves Details)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">वासरे प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय - संकरित</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_hybrid_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_hybrid_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_hybrid_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_hybrid_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_hybrid_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_hybrid_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय - स्थानिक</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_local_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_local_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_local_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_local_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_cow_local_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_cow_local_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">म्हैस</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_buffalo_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_buffalo_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_buffalo_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_buffalo_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_buffalo_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_buffalo_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-bold">एकूण</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_total_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_total_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_total_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_total_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.born_calves_total_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, born_calves_total_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Calved Animals Statistics */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-red-600" />
          वासरू झालेली जनावरे (Calved Animals)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">जनावर प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय - संकरित</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_hybrid_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_hybrid_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_hybrid_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_hybrid_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_hybrid_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_hybrid_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय - स्थानिक</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_local_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_local_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_local_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_local_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_cows_local_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_cows_local_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">म्हैस</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_buffaloes_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_buffaloes_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_buffaloes_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_buffaloes_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.calved_buffaloes_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, calved_buffaloes_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pregnancy Examination Statistics */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-red-600" />
          गर्भधारणा तपासणी (Pregnancy Examination)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">जनावर प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_cow_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_cow_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_cow_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_cow_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_cow_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_cow_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">म्हैस</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_buffalo_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_buffalo_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_buffalo_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_buffalo_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_buffalo_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_buffalo_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-bold">एकूण</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_total_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_total_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_total_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_total_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.pregnancy_examination_total_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, pregnancy_examination_total_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Infertility Examination Statistics */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          वंध्यत्व जनावरांची तपासणी (Infertility Animals Examination)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">जनावर प्रकार</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गाय</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_cow_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_cow_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_cow_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_cow_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_cow_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_cow_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">म्हैस</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_buffalo_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_buffalo_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_buffalo_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_buffalo_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_buffalo_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_buffalo_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-bold">एकूण</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_total_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_total_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_total_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_total_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.infertility_animals_examination_total_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, infertility_animals_examination_total_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center font-bold"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Statistics */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
          इतर आकडेवारी (Other Statistics)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-100">
                <th className="border border-gray-300 px-4 py-2 text-left">तपशील</th>
                <th className="border border-gray-300 px-4 py-2 text-center">लक्ष्य</th>
                <th className="border border-gray-300 px-4 py-2 text-center">चालू महिना</th>
                <th className="border border-gray-300 px-4 py-2 text-center">मागील</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">रुग्णांची सरासरी दैनिक उपस्थिती</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.patients_average_daily_attendance_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, patients_average_daily_attendance_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.patients_average_daily_attendance_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, patients_average_daily_attendance_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.patients_average_daily_attendance_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, patients_average_daily_attendance_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">गोळा केलेली सेवा फी</td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.collected_service_fees_target}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, collected_service_fees_target: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.collected_service_fees_current_month}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, collected_service_fees_current_month: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <input
                    type="number"
                    value={veterinaryFormData.collected_service_fees_previous}
                    onChange={(e) => setVeterinaryFormData(prev => ({...prev, collected_service_fees_previous: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDiseaseInformation = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        रोग माहिती (Disease Information)
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          रोग तपशील (Disease Details)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              गावाचे नाव *
            </label>
            <input
              type="text"
              value={veterinaryFormData.village_name}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, village_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="गावाचे नाव प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              रोगाचे नाव *
            </label>
            <input
              type="text"
              value={veterinaryFormData.disease_name}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, disease_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="रोगाचे नाव प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              उद्भव कालावधी *
            </label>
            <input
              type="text"
              value={veterinaryFormData.incubation_period}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, incubation_period: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="उद्भव कालावधी प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              पशुधन संख्या *
            </label>
            <input
              type="number"
              value={veterinaryFormData.livestock_count}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, livestock_count: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="पशुधन संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              बाधित संख्या *
            </label>
            <input
              type="number"
              value={veterinaryFormData.affected_count}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, affected_count: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="बाधित संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मृत्यू संख्या *
            </label>
            <input
              type="number"
              value={veterinaryFormData.deaths}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, deaths: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मृत्यू संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              लसीकरण संख्या *
            </label>
            <input
              type="number"
              value={veterinaryFormData.vaccinated_count}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, vaccinated_count: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="लसीकरण संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              घेतलेल्या कृती *
            </label>
            <input
              type="text"
              value={veterinaryFormData.actions_taken}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, actions_taken: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="घेतलेल्या कृती प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              १० किमी परिसरातील गावे *
            </label>
            <input
              type="number"
              value={veterinaryFormData.villages_within_10km}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, villages_within_10km: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="गावांची संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              १० किमी परिसरातील पशुधन *
            </label>
            <input
              type="text"
              value={veterinaryFormData.livestock_within_10km}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, livestock_within_10km: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="पशुधन तपशील प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील स्थानिक रोग माहिती *
            </label>
            <input
              type="text"
              value={veterinaryFormData.previous_endemic_disease_info}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, previous_endemic_disease_info: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील रोग माहिती प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EDR सादर करण्याची तारीख *
            </label>
            <input
              type="date"
              value={veterinaryFormData.edr_submission_date}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, edr_submission_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              टीम भेट तारीख *
            </label>
            <input
              type="date"
              value={veterinaryFormData.team_visit_date}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, team_visit_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderVaccinationProgram = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        लसीकरण कार्यक्रम (Vaccination Program)
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Syringe className="h-5 w-5 mr-2 text-red-600" />
          लसीकरण तपशील (Vaccination Details)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              लसीचा प्रकार *
            </label>
            <input
              type="text"
              value={veterinaryFormData.vaccine_type}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, vaccine_type: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="लसीचा प्रकार प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              लसीचे नाव *
            </label>
            <input
              type="text"
              value={veterinaryFormData.vaccine_name}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, vaccine_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="लसीचे नाव प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कार्यक्रमातील जनावरांची संख्या *
            </label>
            <input
              type="text"
              value={veterinaryFormData.number_of_animals_in_program}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, number_of_animals_in_program: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="जनावरांची संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              एकूण लसीकरण *
            </label>
            <input
              type="text"
              value={veterinaryFormData.total_vaccinated}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, total_vaccinated: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="एकूण लसीकरण प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              अलीकडील लसीकरण तारीख *
            </label>
            <input
              type="text"
              value={veterinaryFormData.recently_vaccinated_date}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, recently_vaccinated_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="अलीकडील लसीकरण तारीख प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्राप्त लसीकरण *
            </label>
            <input
              type="text"
              value={veterinaryFormData.received_vaccinated}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, received_vaccinated: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="प्राप्त लसीकरण प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील लसीकरण *
            </label>
            <input
              type="text"
              value={veterinaryFormData.previous_vaccinated}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, previous_vaccinated: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील लसीकरण प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              एकूण लसीकरण संख्या *
            </label>
            <input
              type="text"
              value={veterinaryFormData.total_vaccinated_count}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, total_vaccinated_count: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="एकूण लसीकरण संख्या प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              लसीकरण तारीख *
            </label>
            <input
              type="text"
              value={veterinaryFormData.vaccination_date}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, vaccination_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="लसीकरण तारीख प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              एप्रिलपासून लसीकरण *
            </label>
            <input
              type="text"
              value={veterinaryFormData.since_april_vaccinated}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, since_april_vaccinated: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="एप्रिलपासून लसीकरण प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              लसीकरण न झाल्याचे कारण *
            </label>
            <textarea
              value={veterinaryFormData.reason_not_vaccinated}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, reason_not_vaccinated: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
              placeholder="लसीकरण न झाल्याचे कारण प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchemeProgress = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        योजना प्रगती (Scheme Progress)
      </h3>

      {/* Dairy Animals Group Distribution */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
          दुधारू जनावरांचे गट वितरण (Dairy Animals Group Distribution)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.dairy_animals_group_distribution_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, dairy_animals_group_distribution_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.dairy_animals_group_distribution_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, dairy_animals_group_distribution_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.dairy_animals_group_distribution_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, dairy_animals_group_distribution_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.dairy_animals_group_distribution_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, dairy_animals_group_distribution_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Goat/Sheep Group Distribution */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          शेळी/मेंढी गट वितरण (Goat/Sheep Group Distribution)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.goat_sheep_group_distribution_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, goat_sheep_group_distribution_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.goat_sheep_group_distribution_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, goat_sheep_group_distribution_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.goat_sheep_group_distribution_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, goat_sheep_group_distribution_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.goat_sheep_group_distribution_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, goat_sheep_group_distribution_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Poultry Shed Construction */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          कुक्कुटपालन शेड बांधकाम (Poultry Shed Construction)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.poultry_shed_construction_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, poultry_shed_construction_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.poultry_shed_construction_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, poultry_shed_construction_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.poultry_shed_construction_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, poultry_shed_construction_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.poultry_shed_construction_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, poultry_shed_construction_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Pig Group Distribution */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          डुक्कर गट वितरण (Pig Group Distribution)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.pig_group_distribution_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, pig_group_distribution_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.pig_group_distribution_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, pig_group_distribution_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.pig_group_distribution_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, pig_group_distribution_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.pig_group_distribution_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, pig_group_distribution_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* One Day Old Chicks Distribution */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          एक दिवसाची पिल्ले वितरण (One Day Old Chicks Distribution)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.one_day_old_chicks_distribution_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, one_day_old_chicks_distribution_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.one_day_old_chicks_distribution_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, one_day_old_chicks_distribution_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.one_day_old_chicks_distribution_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, one_day_old_chicks_distribution_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.one_day_old_chicks_distribution_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, one_day_old_chicks_distribution_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Double Yolk Eggs Distribution */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          दुहेरी पिवळ्या अंडी वितरण (Double Yolk Eggs Distribution)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षाचे लक्ष्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.double_yolk_eggs_distribution_target_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, double_yolk_eggs_distribution_target_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षाचे लक्ष्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              चालू वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.double_yolk_eggs_distribution_achieved_current_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, double_yolk_eggs_distribution_achieved_current_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="चालू वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मागील वर्षी साध्य *
            </label>
            <input
              type="text"
              value={veterinaryFormData.double_yolk_eggs_distribution_achieved_previous_year}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, double_yolk_eggs_distribution_achieved_previous_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="मागील वर्षी साध्य प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शेरा *
            </label>
            <input
              type="text"
              value={veterinaryFormData.double_yolk_eggs_distribution_remarks}
              onChange={(e) => setVeterinaryFormData(prev => ({...prev, double_yolk_eggs_distribution_remarks: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="शेरा प्रविष्ट करा"
              required
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessmentAndInstructions = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        मूल्यांकन आणि सूचना (Assessment and Instructions)
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-red-600" />
          सामान्य तांत्रिक मूल्यांकन (General Technical Assessment)
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            सामान्य तांत्रिक मूल्यांकन *
          </label>
          <textarea
            value={veterinaryFormData.general_technical_assessment}
            onChange={(e) => setVeterinaryFormData(prev => ({...prev, general_technical_assessment: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={6}
            placeholder="संस्थेच्या तांत्रिक कामकाजाचे सामान्य मूल्यांकन प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-red-600" />
          दिलेल्या सूचना (Given Instructions)
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दिलेल्या सूचना *
          </label>
          <textarea
            value={veterinaryFormData.given_instructions}
            onChange={(e) => setVeterinaryFormData(prev => ({...prev, given_instructions: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={6}
            placeholder="संस्थेला दिलेल्या सूचना प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.photoDocumentation')}
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Upload Veterinary Inspection Photos
        </h4>
        <p className="text-gray-600 mb-4">
          पशुवैद्यकीय तपासणीसाठी फोटो अपलोड करा
        </p>
        
        {!isViewMode && (
          <>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
            >
              <Camera className="h-4 w-4 mr-2" />
              {t('fims.chooseFiles')}
            </label>
            
            <p className="text-xs text-gray-500 mt-2">
              Maximum 5 photos allowed
            </p>
          </>
        )}
      </div>

      {uploadedPhotos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {t('fims.uploadedPhotos')} ({uploadedPhotos.length}/5)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Veterinary inspection photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {!isViewMode && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                )}
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display existing photos when viewing */}
      {isViewMode && editingInspection?.fims_inspection_photos && editingInspection.fims_inspection_photos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Inspection Photos ({editingInspection.fims_inspection_photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {editingInspection.fims_inspection_photos.map((photo: any, index: number) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photo_url}
                  alt={photo.description || `Veterinary inspection photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {photo.photo_name || `Photo ${index + 1}`}
                </p>
                {photo.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {photo.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message when no photos in view mode */}
      {isViewMode && (!editingInspection?.fims_inspection_photos || editingInspection.fims_inspection_photos.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p>{t('fims.noPhotosFound')}</p>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('fims.uploadingPhotos')}</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderTechnicalWorkReview();
      case 4:
        return renderPatientStatistics();
      case 5:
        return renderSurgeryStatistics();
      case 6:
        return renderDiseaseInformation();
      case 7:
        return renderVaccinationProgram();
      case 8:
        return renderSchemeProgress();
      case 9:
        return renderAssessmentAndInstructions();
      case 10:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return veterinaryFormData.institute_name_address && 
               veterinaryFormData.head_name_contact && 
               veterinaryFormData.inspector_name_designation && 
               veterinaryFormData.visit_date_time && 
               veterinaryFormData.inspection_purpose_reason;
      case 2:
        return inspectionData.location_name;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        return true; // All other steps are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {editingInspection?.mode === 'view' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                {t('fims.viewMode')} - {t('fims.formReadOnly')}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              {editingInspection?.mode === 'view' ? t('fims.viewInspection') : 
               editingInspection?.mode === 'edit' ? t('fims.editInspection') : 
               t('fims.newInspection')} - पशुवैद्यकीय तपासणी
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-2 md:space-x-4 text-xs md:text-sm overflow-x-auto">
            <div className={`${currentStep === 1 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              स्थान तपशील
            </div>
            <div className={`${currentStep === 3 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              तांत्रिक आढावा
            </div>
            <div className={`${currentStep === 4 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              रुग्ण आकडेवारी
            </div>
            <div className={`${currentStep === 5 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              शस्त्रक्रिया
            </div>
            <div className={`${currentStep === 6 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              रोग माहिती
            </div>
            <div className={`${currentStep === 7 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              लसीकरण
            </div>
            <div className={`${currentStep === 8 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              योजना प्रगती
            </div>
            <div className={`${currentStep === 9 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              मूल्यांकन
            </div>
            <div className={`${currentStep === 10 ? 'text-red-600 font-medium' : 'text-gray-500'} whitespace-nowrap`}>
              फोटो
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-red-50/30 to-pink-50/30 rounded-xl shadow-lg border-2 border-red-200 p-4 md:p-6 mb-4 md:mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
          >
            {t('common.previous')}
          </button>

          <div className="flex space-x-2 md:space-x-3">
            {currentStep === 10 ? (
              <>
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Save className="h-4 w-4" />
                  <span>{t('fims.saveAsDraft')}</span>
                </button>
                )}
                {!isViewMode && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading || isUploading}
                  className="px-3 md:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(10, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
                className="px-4 md:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
              >
                {t('common.next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};