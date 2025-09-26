import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Camera,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Users,
  Heart,
  BookOpen,
  Utensils,
  Scale,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AnganwadiTapasaniFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface AnganwadiFormData {
  // Basic Information
  anganwadi_name: string;
  anganwadi_number: string;
  supervisor_name: string;
  helper_name: string;
  village_name: string;
  building_type: string;
  
  // Infrastructure and Basic Facilities
  room_availability: boolean;
  toilet_facility: boolean;
  drinking_water: boolean;
  electricity: boolean;
  kitchen_garden: boolean;
  independent_kitchen: boolean;
  women_health_checkup_space: boolean;
  
  // Equipment and Materials
  weighing_machine: boolean;
  baby_weighing_scale: boolean;
  hammock_weighing_scale: boolean;
  adult_weighing_scale: boolean;
  height_measuring_scale: boolean;
  first_aid_kit: boolean;
  cooking_utensils: boolean;
  water_storage_containers: boolean;
  medicine_kits: boolean;
  teaching_materials: boolean;
  toys_available: boolean;
  pre_school_kit: boolean;
  
  // Records and Documentation
  attendance_register: boolean;
  all_registers: boolean;
  monthly_progress_reports: boolean;
  growth_chart_updated: boolean;
  vaccination_records: boolean;
  nutrition_records: boolean;
  timetable_available: boolean;
  timetable_followed: boolean;
  supervisor_regular_attendance: boolean;
  
  // Children Information
  total_registered: number;
  present_today: number;
  age_0_to_3_years: number;
  age_3_to_6_years: number;
  preschool_education_registered: number;
  preschool_education_present: number;
  
  // Nutrition & Health Services
  hot_meal_served: boolean;
  meal_quality: string;
  take_home_ration: boolean;
  monthly_25_days_meals: boolean;
  thr_provided_regularly: boolean;
  health_checkup_conducted: boolean;
  immunization_updated: boolean;
  vitamin_a_given: boolean;
  iron_tablets_given: boolean;
  regular_weighing: boolean;
  growth_chart_accuracy: boolean;
  vaccination_health_checkup_regular: boolean;
  vaccination_schedule_awareness: boolean;
  
  // Food and Community
  food_provider: string;
  supervisor_participation: string;
  food_distribution_decentralized: boolean;
  children_food_taste_preference: string;
  prescribed_protein_calories: boolean;
  prescribed_weight_food: boolean;
  lab_sample_date: string;
  
  // Community Participation
  village_health_nutrition_planning: string;
  children_attendance_comparison: string;
  preschool_programs_conducted: string;
  community_participation: string;
  committee_member_participation: string;
  home_visits_guidance: string;
  public_opinion_improvement: string;
  
  // Observations & Recommendations
  general_observations: string;
  recommendations: string;
  action_required: string;
  suggestions: string;
  
  // Inspector Information
  inspector_name: string;
  inspector_designation: string;
  visit_date: string;
}

export const AnganwadiTapasaniForm: React.FC<AnganwadiTapasaniFormProps> = ({
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

  // Anganwadi form data
  const [anganwadiFormData, setAnganwadiFormData] = useState<AnganwadiFormData>({
    anganwadi_name: '',
    anganwadi_number: '',
    supervisor_name: '',
    helper_name: '',
    village_name: '',
    building_type: '',
    room_availability: false,
    toilet_facility: false,
    drinking_water: false,
    electricity: false,
    kitchen_garden: false,
    independent_kitchen: false,
    women_health_checkup_space: false,
    weighing_machine: false,
    baby_weighing_scale: false,
    hammock_weighing_scale: false,
    adult_weighing_scale: false,
    height_measuring_scale: false,
    first_aid_kit: false,
    cooking_utensils: false,
    water_storage_containers: false,
    medicine_kits: false,
    teaching_materials: false,
    toys_available: false,
    pre_school_kit: false,
    attendance_register: false,
    all_registers: false,
    monthly_progress_reports: false,
    growth_chart_updated: false,
    vaccination_records: false,
    nutrition_records: false,
    timetable_available: false,
    timetable_followed: false,
    supervisor_regular_attendance: false,
    total_registered: 0,
    present_today: 0,
    age_0_to_3_years: 0,
    age_3_to_6_years: 0,
    preschool_education_registered: 0,
    preschool_education_present: 0,
    hot_meal_served: false,
    meal_quality: '',
    take_home_ration: false,
    monthly_25_days_meals: false,
    thr_provided_regularly: false,
    health_checkup_conducted: false,
    immunization_updated: false,
    vitamin_a_given: false,
    iron_tablets_given: false,
    regular_weighing: false,
    growth_chart_accuracy: false,
    vaccination_health_checkup_regular: false,
    vaccination_schedule_awareness: false,
    food_provider: '',
    supervisor_participation: '',
    food_distribution_decentralized: false,
    children_food_taste_preference: '',
    prescribed_protein_calories: false,
    prescribed_weight_food: false,
    lab_sample_date: '',
    village_health_nutrition_planning: '',
    children_attendance_comparison: '',
    preschool_programs_conducted: '',
    community_participation: '',
    committee_member_participation: '',
    home_visits_guidance: '',
    public_opinion_improvement: '',
    general_observations: '',
    recommendations: '',
    action_required: '',
    suggestions: '',
    inspector_name: '',
    inspector_designation: '',
    visit_date: ''
  });

  // Get anganwadi category
  const anganwadiCategory = categories.find(cat => cat.form_type === 'anganwadi');

  useEffect(() => {
    if (anganwadiCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: anganwadiCategory.id
      }));
    }
  }, [anganwadiCategory]);

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

      // Load anganwadi form data if it exists
      if (editingInspection.fims_anganwadi_forms && editingInspection.fims_anganwadi_forms.length > 0) {
        const formData = editingInspection.fims_anganwadi_forms[0];
        setAnganwadiFormData({
          anganwadi_name: formData.anganwadi_name || '',
          anganwadi_number: formData.anganwadi_number || '',
          supervisor_name: formData.supervisor_name || '',
          helper_name: formData.helper_name || '',
          village_name: formData.village_name || '',
          building_type: formData.building_type || '',
          room_availability: formData.room_availability || false,
          toilet_facility: formData.toilet_facility || false,
          drinking_water: formData.drinking_water || false,
          electricity: formData.electricity || false,
          kitchen_garden: formData.kitchen_garden || false,
          independent_kitchen: formData.independent_kitchen || false,
          women_health_checkup_space: formData.women_health_checkup_space || false,
          weighing_machine: formData.weighing_machine || false,
          baby_weighing_scale: formData.baby_weighing_scale || false,
          hammock_weighing_scale: formData.hammock_weighing_scale || false,
          adult_weighing_scale: formData.adult_weighing_scale || false,
          height_measuring_scale: formData.height_measuring_scale || false,
          first_aid_kit: formData.first_aid_kit || false,
          cooking_utensils: formData.cooking_utensils || false,
          water_storage_containers: formData.water_storage_containers || false,
          medicine_kits: formData.medicine_kits || false,
          teaching_materials: formData.teaching_materials || false,
          toys_available: formData.toys_available || false,
          pre_school_kit: formData.pre_school_kit || false,
          attendance_register: formData.attendance_register || false,
          all_registers: formData.all_registers || false,
          monthly_progress_reports: formData.monthly_progress_reports || false,
          growth_chart_updated: formData.growth_chart_updated || false,
          vaccination_records: formData.vaccination_records || false,
          nutrition_records: formData.nutrition_records || false,
          timetable_available: formData.timetable_available || false,
          timetable_followed: formData.timetable_followed || false,
          supervisor_regular_attendance: formData.supervisor_regular_attendance || false,
          total_registered: formData.total_registered || 0,
          present_today: formData.present_today || 0,
          age_0_to_3_years: formData.age_0_to_3_years || 0,
          age_3_to_6_years: formData.age_3_to_6_years || 0,
          preschool_education_registered: formData.preschool_education_registered || 0,
          preschool_education_present: formData.preschool_education_present || 0,
          hot_meal_served: formData.hot_meal_served || false,
          meal_quality: formData.meal_quality || '',
          take_home_ration: formData.take_home_ration || false,
          monthly_25_days_meals: formData.monthly_25_days_meals || false,
          thr_provided_regularly: formData.thr_provided_regularly || false,
          health_checkup_conducted: formData.health_checkup_conducted || false,
          immunization_updated: formData.immunization_updated || false,
          vitamin_a_given: formData.vitamin_a_given || false,
          iron_tablets_given: formData.iron_tablets_given || false,
          regular_weighing: formData.regular_weighing || false,
          growth_chart_accuracy: formData.growth_chart_accuracy || false,
          vaccination_health_checkup_regular: formData.vaccination_health_checkup_regular || false,
          vaccination_schedule_awareness: formData.vaccination_schedule_awareness || false,
          food_provider: formData.food_provider || '',
          supervisor_participation: formData.supervisor_participation || '',
          food_distribution_decentralized: formData.food_distribution_decentralized || false,
          children_food_taste_preference: formData.children_food_taste_preference || '',
          prescribed_protein_calories: formData.prescribed_protein_calories || false,
          prescribed_weight_food: formData.prescribed_weight_food || false,
          lab_sample_date: formData.lab_sample_date || '',
          village_health_nutrition_planning: formData.village_health_nutrition_planning || '',
          children_attendance_comparison: formData.children_attendance_comparison || '',
          preschool_programs_conducted: formData.preschool_programs_conducted || '',
          community_participation: formData.community_participation || '',
          committee_member_participation: formData.committee_member_participation || '',
          home_visits_guidance: formData.home_visits_guidance || '',
          public_opinion_improvement: formData.public_opinion_improvement || '',
          general_observations: formData.general_observations || '',
          recommendations: formData.recommendations || '',
          action_required: formData.action_required || '',
          suggestions: formData.suggestions || '',
          inspector_name: formData.inspector_name || '',
          inspector_designation: formData.inspector_designation || '',
          visit_date: formData.visit_date || ''
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
        const fileName = `anganwadi_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

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
            description: `Anganwadi inspection photo ${i + 1}`,
            photo_order: i + 1
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
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
    return `ANG-${year}${month}${day}-${time}`;
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
            form_data: anganwadiFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert anganwadi form record
        const { error: formError } = await supabase
          .from('fims_anganwadi_forms')
          .upsert({
            inspection_id: editingInspection.id,
            ...anganwadiFormData
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
            form_data: anganwadiFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create anganwadi form record
        const { error: formError } = await supabase
          .from('fims_anganwadi_forms')
          .insert({
            inspection_id: inspectionResult.id,
            ...anganwadiFormData
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
      alert('Error saving inspection: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-purple-600" />
        {t('fims.basicInformation')}
      </h3>
      <p className="text-gray-600 mb-6">{t('fims.enterBasicDetails')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.anganwadiName')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterAnganwadiName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.anganwadiNumber')} *
          </label>
          <input
            type="text"
            value={anganwadiFormData.anganwadi_number}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, anganwadi_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterAnganwadiNumber')}
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.supervisorName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.supervisor_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterSupervisorName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.helperName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.helper_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, helper_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterHelperName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.villageName')}
          </label>
          <input
            type="text"
            value={anganwadiFormData.village_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterVillageName')}
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.buildingType')}
          </label>
          <select
            value={anganwadiFormData.building_type}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, building_type: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isViewMode}
          >
            <option value="">{t('fims.selectBuildingType')}</option>
            <option value="own">{t('fims.ownBuilding')}</option>
            <option value="rented">{t('fims.rentedBuilding')}</option>
            <option value="free">{t('fims.freeBuilding')}</option>
            <option value="no_building">{t('fims.noBuilding')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेट दिनांक
          </label>
          <input
            type="date"
            value={anganwadiFormData.visit_date}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, visit_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            निरीक्षकाचे नाव
          </label>
          <input
            type="text"
            value={anganwadiFormData.inspector_name}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, inspector_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="निरीक्षकाचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            पदनाम
          </label>
          <input
            type="text"
            value={anganwadiFormData.inspector_designation}
            onChange={(e) => setAnganwadiFormData(prev => ({...prev, inspector_designation: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="पदनाम प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          {t('fims.locationInformation')}
        </h3>
      </div>
      
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 space-y-6">
        <p className="text-gray-600">{t('fims.provideLocationDetails')}</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.locationName')} *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t('fims.enterLocationName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.plannedDate')}
            </label>
            <input
              type="date"
              value={inspectionData.planned_date}
              onChange={(e) => setInspectionData(prev => ({...prev, planned_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.gpsLocationCapture')}
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading || isViewMode}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              <span>{isLoading ? t('fims.gettingLocation') : t('fims.getCurrentLocation')}</span>
            </button>
          </div>
        </div>

        {inspectionData.latitude && inspectionData.longitude && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">{t('fims.locationCaptured')}</p>
            <div className="text-xs text-green-600 space-y-1">
              <p>{t('fims.latitude')}: {inspectionData.latitude.toFixed(6)}</p>
              <p>{t('fims.longitude')}: {inspectionData.longitude.toFixed(6)}</p>
              <p>{t('fims.accuracy')}: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.fullAddress')}
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder={t('fims.enterCompleteAddress')}
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderAnganwadiForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.completeDetailedChecklist')}
      </h3>

      {/* Section A: Infrastructure and Basic Facilities */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionA')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'room_availability', label: t('fims.roomAvailability') },
            { key: 'toilet_facility', label: t('fims.toiletFacility') },
            { key: 'drinking_water', label: t('fims.drinkingWater') },
            { key: 'electricity', label: t('fims.electricity') },
            { key: 'kitchen_garden', label: t('fims.kitchenGarden') },
            { key: 'independent_kitchen', label: 'स्वतंत्र बंद स्वयंपाकघर' },
            { key: 'women_health_checkup_space', label: 'महिलांच्या आरोग्य तपासणीसाठी जागा' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Equipment and Materials */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Scale className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionB')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'weighing_machine', label: t('fims.weighingMachine') },
            { key: 'baby_weighing_scale', label: 'बाळाचे वजन मशीन' },
            { key: 'hammock_weighing_scale', label: 'झुला वजन मशीन' },
            { key: 'adult_weighing_scale', label: 'प्रौढ वजन मशीन' },
            { key: 'height_measuring_scale', label: t('fims.heightMeasuringScale') },
            { key: 'first_aid_kit', label: t('fims.firstAidKit') },
            { key: 'cooking_utensils', label: 'स्वयंपाकाची भांडी' },
            { key: 'water_storage_containers', label: 'पाणी साठवण्याची भांडी' },
            { key: 'medicine_kits', label: 'औषध किट' },
            { key: 'teaching_materials', label: t('fims.teachingMaterials') },
            { key: 'toys_available', label: t('fims.toysAvailable') },
            { key: 'pre_school_kit', label: 'प्री-स्कूल किट' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: Records and Documentation */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionC')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'attendance_register', label: t('fims.attendanceRegister') },
            { key: 'all_registers', label: 'सर्व आवश्यक नोंदवह्या' },
            { key: 'monthly_progress_reports', label: 'मासिक प्रगती अहवाल' },
            { key: 'growth_chart_updated', label: t('fims.growthChartUpdated') },
            { key: 'vaccination_records', label: t('fims.vaccinationRecords') },
            { key: 'nutrition_records', label: t('fims.nutritionRecords') },
            { key: 'timetable_available', label: 'वेळापत्रक उपलब्ध' },
            { key: 'timetable_followed', label: 'वेळापत्रकाचे पालन' },
            { key: 'supervisor_regular_attendance', label: 'पर्यवेक्षकाची नियमित उपस्थिती' }
          ].map((field) => (
            <div key={field.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.key}
                checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                disabled={isViewMode}
              />
              <label htmlFor={field.key} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Section D: Children Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionD')}
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.totalRegistered')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.total_registered}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, total_registered: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.presentToday')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.present_today}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, present_today: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.age0to3Years')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.age_0_to_3_years}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, age_0_to_3_years: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.age3to6Years')}
            </label>
            <input
              type="number"
              value={anganwadiFormData.age_3_to_6_years}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, age_3_to_6_years: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्री-स्कूल शिक्षण नोंदणीकृत
            </label>
            <input
              type="number"
              value={anganwadiFormData.preschool_education_registered}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_registered: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्री-स्कूल शिक्षण उपस्थित
            </label>
            <input
              type="number"
              value={anganwadiFormData.preschool_education_present}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_education_present: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Section E: Nutrition & Health Services */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionE')}
        </h4>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'hot_meal_served', label: t('fims.hotMealServed') },
              { key: 'take_home_ration', label: t('fims.takeHomeRation') },
              { key: 'monthly_25_days_meals', label: 'मासिक २५ दिवस जेवण' },
              { key: 'thr_provided_regularly', label: 'THR नियमित पुरवठा' },
              { key: 'health_checkup_conducted', label: t('fims.healthCheckupConducted') },
              { key: 'immunization_updated', label: t('fims.immunizationUpdated') },
              { key: 'vitamin_a_given', label: t('fims.vitaminAGiven') },
              { key: 'iron_tablets_given', label: t('fims.ironTabletsGiven') },
              { key: 'regular_weighing', label: 'नियमित वजन' },
              { key: 'growth_chart_accuracy', label: 'वाढ चार्ट अचूकता' },
              { key: 'vaccination_health_checkup_regular', label: 'नियमित लसीकरण आणि आरोग्य तपासणी' },
              { key: 'vaccination_schedule_awareness', label: 'लसीकरण वेळापत्रक जागरूकता' },
              { key: 'food_distribution_decentralized', label: 'अन्न वितरण विकेंद्रीकृत' },
              { key: 'prescribed_protein_calories', label: 'विहित प्रथिने आणि कॅलरीज' },
              { key: 'prescribed_weight_food', label: 'विहित वजनाचे अन्न' }
            ].map((field) => (
              <div key={field.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={field.key}
                  checked={anganwadiFormData[field.key as keyof AnganwadiFormData] as boolean}
                  onChange={(e) => setAnganwadiFormData(prev => ({...prev, [field.key]: e.target.checked}))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isViewMode}
                />
                <label htmlFor={field.key} className="text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fims.mealQuality')}
              </label>
              <select
                value={anganwadiFormData.meal_quality}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, meal_quality: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">{t('fims.selectQuality')}</option>
                <option value="excellent">{t('fims.excellent')}</option>
                <option value="good">{t('fims.good')}</option>
                <option value="average">{t('fims.average')}</option>
                <option value="poor">{t('fims.poor')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                अन्न पुरवठादार
              </label>
              <input
                type="text"
                value={anganwadiFormData.food_provider}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, food_provider: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="अन्न पुरवठादार नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पर्यवेक्षक सहभाग
              </label>
              <input
                type="text"
                value={anganwadiFormData.supervisor_participation}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, supervisor_participation: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="पर्यवेक्षक सहभाग तपशील प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मुलांची अन्न चव पसंती
              </label>
              <input
                type="text"
                value={anganwadiFormData.children_food_taste_preference}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_food_taste_preference: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="मुलांची अन्न चव पसंती प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रयोगशाळा नमुना दिनांक
              </label>
              <input
                type="date"
                value={anganwadiFormData.lab_sample_date}
                onChange={(e) => setAnganwadiFormData(prev => ({...prev, lab_sample_date: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Community Participation Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-600" />
          समुदायिक सहभाग (Community Participation)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              गावातील आरोग्य आणि पोषण नियोजन
            </label>
            <textarea
              value={anganwadiFormData.village_health_nutrition_planning}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, village_health_nutrition_planning: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="गावातील आरोग्य आणि पोषण नियोजन तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मुलांची उपस्थिती तुलना
            </label>
            <textarea
              value={anganwadiFormData.children_attendance_comparison}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, children_attendance_comparison: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="मुलांची उपस्थिती तुलना तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्री-स्कूल कार्यक्रम आयोजित
            </label>
            <textarea
              value={anganwadiFormData.preschool_programs_conducted}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, preschool_programs_conducted: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="प्री-स्कूल कार्यक्रम तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              समुदायिक सहभाग
            </label>
            <textarea
              value={anganwadiFormData.community_participation}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, community_participation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="समुदायिक सहभाग तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              समिती सदस्यांचा सहभाग
            </label>
            <textarea
              value={anganwadiFormData.committee_member_participation}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, committee_member_participation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="समिती सदस्यांचा सहभाग तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              घर भेटी मार्गदर्शन
            </label>
            <textarea
              value={anganwadiFormData.home_visits_guidance}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, home_visits_guidance: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="घर भेटी मार्गदर्शन तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              सार्वजनिक मत सुधारणा
            </label>
            <textarea
              value={anganwadiFormData.public_opinion_improvement}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, public_opinion_improvement: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="सार्वजनिक मत सुधारणा तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Section F: Observations & Recommendations */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
          {t('fims.sectionF')}
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.generalObservations')}
            </label>
            <textarea
              value={anganwadiFormData.general_observations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, general_observations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterGeneralObservations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.recommendations')}
            </label>
            <textarea
              value={anganwadiFormData.recommendations}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, recommendations: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterRecommendations')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fims.actionRequired')}
            </label>
            <textarea
              value={anganwadiFormData.action_required}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, action_required: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder={t('fims.enterActionRequired')}
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              सुझाव
            </label>
            <textarea
              value={anganwadiFormData.suggestions}
              onChange={(e) => setAnganwadiFormData(prev => ({...prev, suggestions: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="सुझाव प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.photoDocumentation')}
      </h3>
      <p className="text-gray-600 mb-6">{t('fims.uploadPhotosToDocument')}</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {t('fims.uploadInspectionPhotos')}
        </h4>
        <p className="text-gray-600 mb-4">
          {t('fims.clickToSelectPhotos')}
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
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
            >
              <Camera className="h-4 w-4 mr-2" />
              {t('fims.chooseFiles')}
            </label>
            
            <p className="text-xs text-gray-500 mt-2">
              {t('fims.maxPhotosAllowed')}
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
                  alt={`Anganwadi photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {!isViewMode && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-sm"
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
                  alt={photo.description || `Anganwadi photo ${index + 1}`}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('fims.uploadingPhotos')}</p>
          <p className="text-sm text-gray-500">{t('fims.pleaseWaitProcessing')}</p>
        </div>
      )}

      {/* Ready to Submit Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {t('fims.readyToSubmit')}
        </h4>
        <p className="text-purple-800 mb-4">
          {t('fims.reviewInspectionDetails')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {!isViewMode && (
            <>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading || isUploading}
                className="flex-1 px-4 py-3 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{t('fims.saveAsDraft')}</span>
              </button>
              
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading || isUploading}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderAnganwadiForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return anganwadiFormData.anganwadi_name && anganwadiFormData.anganwadi_number;
      case 2:
        return inspectionData.location_name;
      case 3:
        return true; // Form is optional, can proceed
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          {editingInspection?.mode === 'view' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                {t('fims.viewMode')}
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
               t('fims.newInspection')} - {t('fims.anganwadiCenterInspection')}
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.basicDetails')}
            </div>
            <div className={`${currentStep === 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.inspectionDetails')}
            </div>
            <div className={`${currentStep === 4 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl shadow-lg border-2 border-purple-200 p-4 md:p-6 mb-4 md:mb-6">
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
            {currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
                className="px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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