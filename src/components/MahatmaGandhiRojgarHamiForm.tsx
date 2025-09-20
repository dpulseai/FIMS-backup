import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  Send,
  Building,
  FileText,
  Calendar,
  User,
  Users,
  ClipboardCheck,
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MahatmaGandhiRojgarHamiFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface MahatmaGandhiFormData {
  // Basic inspection information
  inspection_date: string;
  inspector_name: string;
  inspector_designation: string;
  
  // Work details
  work_name: string;
  gram_panchayat: string;
  village: string;
  tehsil: string;
  district: string;
  
  // Work type and planning
  work_type: string; // वैयक्तिक / सार्वजनिक
  annual_action_plan_included: string; // होय / नाही
  annual_action_plan_year: string;
  
  // Implementation
  implementation_agency: string;
  work_code: string;
  
  // Budget details
  estimated_amount_unskilled: string;
  estimated_amount_skilled: string;
  estimated_amount_total: string;
  dsr_department: string;
  dsr_year: string;
  
  // NREGA Soft records
  nrega_soft_records_correct: string; // होय / नाही
  nrega_soft_form_a: string; // होय / नाही
  nrega_soft_form_b: string; // होय / नाही
  
  // Convergence details
  work_under_convergence: string; // होय / नाही
  convergence_department: string;
  convergence_fund_details: string;
  mgnrega_unskilled: string;
  mgnrega_skilled: string;
  mgnrega_total: string;
  other_dept_unskilled: string;
  other_dept_skilled: string;
  other_dept_total: string;
  
  // Attendance and workers
  attendance_register_workers: string;
  actual_workers_present: string;
  
  // Facilities for workers
  shelter_for_workers: string;
  first_aid_kit: string;
  drinking_water: string;
  childcare_for_workers_children: string;
  
  // Work status and expenses
  current_work_status: string;
  expenses_unskilled: string;
  expenses_skilled: string;
  expenses_total: string;
  
  // Payment details
  previous_attendance_closure_date: string;
  wages_deposited_timely: string; // होय / नाही
  delay_compensation_provided: string; // होय / नाही
  
  // Aadhaar and payments
  aadhaar_based_payment: string; // होय / नाही
  payment_failure_reasons: string;
  
  // Job cards
  workers_have_job_cards: string; // होय / नाही
  job_card_records_updated: string; // होय / नाही
  
  // Work file and documentation
  work_file_updated: string; // होय / नाही
  citizen_information_board: string; // होय / नाही
  
  // Measurements
  work_measurement_done: string; // होय / नाही
  measurement_book_number: string;
  all_measurements_recorded: string; // होय / नाही
  senior_technical_officer_check: string; // होय / नाही
  measurement_discrepancy: string; // होय / नाही
  discrepancy_details: string;
  
  // Geo-tagging and quality
  work_geotagged: string; // होय / नाही
  other_important_matters: string;
  overall_work_quality: string;
  work_utility_feedback: string;
  
  // Final details
  inspection_date_final: string;
  inspection_location: string;
  inspector_name_final: string;
  inspector_designation_final: string;
  inspector_office: string;
}

export const MahatmaGandhiRojgarHamiForm: React.FC<MahatmaGandhiRojgarHamiFormProps> = ({
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

  // Mahatma Gandhi Rojgar Hami form data
  const [mahatmaGandhiFormData, setMahatmaGandhiFormData] = useState<MahatmaGandhiFormData>({
    inspection_date: '',
    inspector_name: '',
    inspector_designation: '',
    work_name: '',
    gram_panchayat: '',
    village: '',
    tehsil: '',
    district: '',
    work_type: '',
    annual_action_plan_included: '',
    annual_action_plan_year: '',
    implementation_agency: '',
    work_code: '',
    estimated_amount_unskilled: '',
    estimated_amount_skilled: '',
    estimated_amount_total: '',
    dsr_department: '',
    dsr_year: '',
    nrega_soft_records_correct: '',
    nrega_soft_form_a: '',
    nrega_soft_form_b: '',
    work_under_convergence: '',
    convergence_department: '',
    convergence_fund_details: '',
    mgnrega_unskilled: '',
    mgnrega_skilled: '',
    mgnrega_total: '',
    other_dept_unskilled: '',
    other_dept_skilled: '',
    other_dept_total: '',
    attendance_register_workers: '',
    actual_workers_present: '',
    shelter_for_workers: '',
    first_aid_kit: '',
    drinking_water: '',
    childcare_for_workers_children: '',
    current_work_status: '',
    expenses_unskilled: '',
    expenses_skilled: '',
    expenses_total: '',
    previous_attendance_closure_date: '',
    wages_deposited_timely: '',
    delay_compensation_provided: '',
    aadhaar_based_payment: '',
    payment_failure_reasons: '',
    workers_have_job_cards: '',
    job_card_records_updated: '',
    work_file_updated: '',
    citizen_information_board: '',
    work_measurement_done: '',
    measurement_book_number: '',
    all_measurements_recorded: '',
    senior_technical_officer_check: '',
    measurement_discrepancy: '',
    discrepancy_details: '',
    work_geotagged: '',
    other_important_matters: '',
    overall_work_quality: '',
    work_utility_feedback: '',
    inspection_date_final: '',
    inspection_location: '',
    inspector_name_final: '',
    inspector_designation_final: '',
    inspector_office: ''
  });

  // Get mahatma gandhi category
  const mahatmaGandhiCategory = categories.find(cat => cat.form_type === 'mahatma_gandhi_rojgar_hami');

  useEffect(() => {
    if (mahatmaGandhiCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: mahatmaGandhiCategory.id
      }));
    }
  }, [mahatmaGandhiCategory]);

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
        setMahatmaGandhiFormData({
          ...mahatmaGandhiFormData,
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
        const fileName = `mahatma_gandhi_rojgar_hami_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `MGNREGA work photo ${i + 1}`
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
    return `MGRH-${year}${month}${day}-${time}`;
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
            form_data: mahatmaGandhiFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert mahatma_gandhi_rastriya_gramin_tapasani_praptra form record
        const { error: formError } = await supabase
          .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
          .upsert({
            inspection_id: editingInspection.id,
            inspection_date: mahatmaGandhiFormData.inspection_date || new Date().toISOString().split('T')[0],
            officer_name: mahatmaGandhiFormData.inspector_name,
            work_name: mahatmaGandhiFormData.work_name,
            gram_panchayat: mahatmaGandhiFormData.gram_panchayat,
            village: mahatmaGandhiFormData.village,
            tehsil: mahatmaGandhiFormData.tehsil,
            district: mahatmaGandhiFormData.district,
            work_type: mahatmaGandhiFormData.work_type,
            annual_plan: mahatmaGandhiFormData.annual_action_plan_included,
            plan_year: mahatmaGandhiFormData.annual_action_plan_year,
            implementing_agency: mahatmaGandhiFormData.implementation_agency,
            work_code: mahatmaGandhiFormData.work_code,
            unskilled_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_unskilled) || 0,
            skilled_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_skilled) || 0,
            total_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_total) || 0,
            dsr_department: mahatmaGandhiFormData.dsr_department,
            dsr_year: mahatmaGandhiFormData.dsr_year,
            nrega_records: mahatmaGandhiFormData.nrega_soft_records_correct,
            nrega_form_a: mahatmaGandhiFormData.nrega_soft_form_a,
            nrega_form_b: mahatmaGandhiFormData.nrega_soft_form_b,
            convergence: mahatmaGandhiFormData.work_under_convergence,
            department_name: mahatmaGandhiFormData.convergence_department,
            fund_details: mahatmaGandhiFormData.convergence_fund_details,
            mgnrega_unskilled: parseFloat(mahatmaGandhiFormData.mgnrega_unskilled) || 0,
            mgnrega_skilled: parseFloat(mahatmaGandhiFormData.mgnrega_skilled) || 0,
            mgnrega_total: parseFloat(mahatmaGandhiFormData.mgnrega_total) || 0,
            other_dept_unskilled: parseFloat(mahatmaGandhiFormData.other_dept_unskilled) || 0,
            other_dept_skilled: parseFloat(mahatmaGandhiFormData.other_dept_skilled) || 0,
            other_dept_total: parseFloat(mahatmaGandhiFormData.other_dept_total) || 0,
            recorded_workers: parseInt(mahatmaGandhiFormData.attendance_register_workers) || 0,
            present_workers: parseInt(mahatmaGandhiFormData.actual_workers_present) || 0,
            shelter: mahatmaGandhiFormData.shelter_for_workers,
            first_aid: mahatmaGandhiFormData.first_aid_kit,
            drinking_water: mahatmaGandhiFormData.drinking_water,
            child_care: mahatmaGandhiFormData.childcare_for_workers_children,
            current_status: mahatmaGandhiFormData.current_work_status,
            expense_unskilled: parseFloat(mahatmaGandhiFormData.expenses_unskilled) || 0,
            expense_skilled: parseFloat(mahatmaGandhiFormData.expenses_skilled) || 0,
            expense_total: parseFloat(mahatmaGandhiFormData.expenses_total) || 0,
            attendance_close_date: mahatmaGandhiFormData.previous_attendance_closure_date || new Date().toISOString().split('T')[0],
            wage_deposited: mahatmaGandhiFormData.wages_deposited_timely,
            delay_compensation: mahatmaGandhiFormData.delay_compensation_provided,
            aadhaar_wage: mahatmaGandhiFormData.aadhaar_based_payment,
            wage_not_deposited_reasons: mahatmaGandhiFormData.payment_failure_reasons,
            job_card_available: mahatmaGandhiFormData.workers_have_job_cards,
            job_card_updated: mahatmaGandhiFormData.job_card_records_updated,
            work_file_updated: mahatmaGandhiFormData.work_file_updated,
            cib_available: mahatmaGandhiFormData.citizen_information_board,
            measurement_taken: mahatmaGandhiFormData.work_measurement_done,
            measurement_book_no: mahatmaGandhiFormData.measurement_book_number,
            all_measurements_recorded: mahatmaGandhiFormData.all_measurements_recorded,
            senior_officer_check: mahatmaGandhiFormData.senior_technical_officer_check,
            measurement_discrepancy: mahatmaGandhiFormData.measurement_discrepancy,
            discrepancy_details: mahatmaGandhiFormData.discrepancy_details,
            geo_tagging: mahatmaGandhiFormData.work_geotagged,
            other_important_matters: mahatmaGandhiFormData.other_important_matters,
            overall_quality: mahatmaGandhiFormData.overall_work_quality,
            utility_feedback: mahatmaGandhiFormData.work_utility_feedback,
            final_date: mahatmaGandhiFormData.inspection_date_final || new Date().toISOString().split('T')[0],
            final_place: mahatmaGandhiFormData.inspection_location,
            final_officer_name: mahatmaGandhiFormData.inspector_name_final,
            final_designation: mahatmaGandhiFormData.inspector_designation_final,
            final_office: mahatmaGandhiFormData.inspector_office
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
            form_data: mahatmaGandhiFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create mahatma_gandhi_rastriya_gramin_tapasani_praptra form record
        const { error: formError } = await supabase
          .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
          .insert({
            inspection_id: inspectionResult.id,
            inspection_date: mahatmaGandhiFormData.inspection_date || new Date().toISOString().split('T')[0],
            officer_name: mahatmaGandhiFormData.inspector_name,
            work_name: mahatmaGandhiFormData.work_name,
            gram_panchayat: mahatmaGandhiFormData.gram_panchayat,
            village: mahatmaGandhiFormData.village,
            tehsil: mahatmaGandhiFormData.tehsil,
            district: mahatmaGandhiFormData.district,
            work_type: mahatmaGandhiFormData.work_type,
            annual_plan: mahatmaGandhiFormData.annual_action_plan_included,
            plan_year: mahatmaGandhiFormData.annual_action_plan_year,
            implementing_agency: mahatmaGandhiFormData.implementation_agency,
            work_code: mahatmaGandhiFormData.work_code,
            unskilled_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_unskilled) || 0,
            skilled_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_skilled) || 0,
            total_amount: parseFloat(mahatmaGandhiFormData.estimated_amount_total) || 0,
            dsr_department: mahatmaGandhiFormData.dsr_department,
            dsr_year: mahatmaGandhiFormData.dsr_year,
            nrega_records: mahatmaGandhiFormData.nrega_soft_records_correct,
            nrega_form_a: mahatmaGandhiFormData.nrega_soft_form_a,
            nrega_form_b: mahatmaGandhiFormData.nrega_soft_form_b,
            convergence: mahatmaGandhiFormData.work_under_convergence,
            department_name: mahatmaGandhiFormData.convergence_department,
            fund_details: mahatmaGandhiFormData.convergence_fund_details,
            mgnrega_unskilled: parseFloat(mahatmaGandhiFormData.mgnrega_unskilled) || 0,
            mgnrega_skilled: parseFloat(mahatmaGandhiFormData.mgnrega_skilled) || 0,
            mgnrega_total: parseFloat(mahatmaGandhiFormData.mgnrega_total) || 0,
            other_dept_unskilled: parseFloat(mahatmaGandhiFormData.other_dept_unskilled) || 0,
            other_dept_skilled: parseFloat(mahatmaGandhiFormData.other_dept_skilled) || 0,
            other_dept_total: parseFloat(mahatmaGandhiFormData.other_dept_total) || 0,
            recorded_workers: parseInt(mahatmaGandhiFormData.attendance_register_workers) || 0,
            present_workers: parseInt(mahatmaGandhiFormData.actual_workers_present) || 0,
            shelter: mahatmaGandhiFormData.shelter_for_workers,
            first_aid: mahatmaGandhiFormData.first_aid_kit,
            drinking_water: mahatmaGandhiFormData.drinking_water,
            child_care: mahatmaGandhiFormData.childcare_for_workers_children,
            current_status: mahatmaGandhiFormData.current_work_status,
            expense_unskilled: parseFloat(mahatmaGandhiFormData.expenses_unskilled) || 0,
            expense_skilled: parseFloat(mahatmaGandhiFormData.expenses_skilled) || 0,
            expense_total: parseFloat(mahatmaGandhiFormData.expenses_total) || 0,
            attendance_close_date: mahatmaGandhiFormData.previous_attendance_closure_date || new Date().toISOString().split('T')[0],
            wage_deposited: mahatmaGandhiFormData.wages_deposited_timely,
            delay_compensation: mahatmaGandhiFormData.delay_compensation_provided,
            aadhaar_wage: mahatmaGandhiFormData.aadhaar_based_payment,
            wage_not_deposited_reasons: mahatmaGandhiFormData.payment_failure_reasons,
            job_card_available: mahatmaGandhiFormData.workers_have_job_cards,
            job_card_updated: mahatmaGandhiFormData.job_card_records_updated,
            work_file_updated: mahatmaGandhiFormData.work_file_updated,
            cib_available: mahatmaGandhiFormData.citizen_information_board,
            measurement_taken: mahatmaGandhiFormData.work_measurement_done,
            measurement_book_no: mahatmaGandhiFormData.measurement_book_number,
            all_measurements_recorded: mahatmaGandhiFormData.all_measurements_recorded,
            senior_officer_check: mahatmaGandhiFormData.senior_technical_officer_check,
            measurement_discrepancy: mahatmaGandhiFormData.measurement_discrepancy,
            discrepancy_details: mahatmaGandhiFormData.discrepancy_details,
            geo_tagging: mahatmaGandhiFormData.work_geotagged,
            other_important_matters: mahatmaGandhiFormData.other_important_matters,
            overall_quality: mahatmaGandhiFormData.overall_work_quality,
            utility_feedback: mahatmaGandhiFormData.work_utility_feedback,
            final_date: mahatmaGandhiFormData.inspection_date_final || new Date().toISOString().split('T')[0],
            final_place: mahatmaGandhiFormData.inspection_location,
            final_officer_name: mahatmaGandhiFormData.inspector_name_final,
            final_designation: mahatmaGandhiFormData.inspector_designation_final,
            final_office: mahatmaGandhiFormData.inspector_office
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
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-green-600" />
        मूलभूत माहिती (Basic Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1] तपासणीचा दिनांक *
          </label>
          <input
            type="date"
            value={mahatmaGandhiFormData.inspection_date}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspection_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2] तपासणी करणाऱ्या अधिकारी-यांचे नाव *
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.inspector_name}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspector_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            हुद्दा
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.inspector_designation}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspector_designation: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="हुद्दा प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3] कामाचे नाव *
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.work_name}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="कामाचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ग्रामपंचायत
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.gram_panchayat}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, gram_panchayat: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ग्रामपंचायत प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            गाव
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.village}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, village: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="गाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तहसील
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.tehsil}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, tehsil: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="तहसील प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            जिल्हा
          </label>
          <input
            type="text"
            value={mahatmaGandhiFormData.district}
            onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, district: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="जिल्हा प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderMahatmaGandhiForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी योजने अंतर्गत कामांच्या तपासणीसाठी प्रपत्र
      </h3>

      {/* Work Type and Planning */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2 text-green-600" />
          कामाचा प्रकार आणि नियोजन (Work Type and Planning)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (अ) कामाचा प्रकार
            </label>
            <select
              value={mahatmaGandhiFormData.work_type}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_type: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">प्रकार निवडा</option>
              <option value="वैयक्तिक">वैयक्तिक</option>
              <option value="सार्वजनिक">सार्वजनिक</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (ब) वार्षिक कृती आराखडा अंतर्गत कामाचा समावेश आहे काय ?
            </label>
            <select
              value={mahatmaGandhiFormData.annual_action_plan_included}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, annual_action_plan_included: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (क) वार्षिक कृती आराखडयाचे वर्ष
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.annual_action_plan_year}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, annual_action_plan_year: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="वर्ष प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4] कार्यान्वयीन यंत्रणेचे नाव
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.implementation_agency}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, implementation_agency: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="यंत्रणेचे नाव प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              5] कामाचा सांकेतांक
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.work_code}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_code: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="सांकेतांक प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Budget Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          6] अंदाजपत्रकीय रक्कम आणि DSR तपशील (Budget Details and DSR)
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (अ) अकुशल
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.estimated_amount_unskilled}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, estimated_amount_unskilled: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="अकुशल रक्कम"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कुशल
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.estimated_amount_skilled}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, estimated_amount_skilled: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="कुशल रक्कम"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                एकूण
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.estimated_amount_total}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, estimated_amount_total: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="एकूण रक्कम"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (ब) DSR विभाग
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.dsr_department}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, dsr_department: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="विभाग प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                वर्ष
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.dsr_year}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, dsr_year: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="वर्ष प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* NREGA Soft Records */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          7] NREGA Soft वरील नोंदी (NREGA Soft Records)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NREGA Soft वरील नोंदी योग्य आहेत काय ?
            </label>
            <select
              value={mahatmaGandhiFormData.nrega_soft_records_correct}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, nrega_soft_records_correct: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (अ) NREGA Soft मधील कामाच्या सर्वसाधारण माहितीचे प्रपत्र - अ
              </label>
              <select
                value={mahatmaGandhiFormData.nrega_soft_form_a}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, nrega_soft_form_a: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (ब) NREGA Soft मधील कामावर साहित्य खर्चाच्या माहितीचे प्रपत्र - ब
              </label>
              <select
                value={mahatmaGandhiFormData.nrega_soft_form_b}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, nrega_soft_form_b: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              (जिल्हा MIS समन्वयक यांनी NREGA Soft वरील प्रपत्र - अ व प्रपत्र - ब तपासणी अधिकाऱ्याला उपलब्ध करून द्यावे.)
            </p>
          </div>
        </div>
      </div>

      {/* Convergence Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Building className="h-5 w-5 mr-2 text-green-600" />
          8] अभिसरण तपशील (Convergence Details)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              काम अभिसरणांतर्गत आहे काय?
            </label>
            <select
              value={mahatmaGandhiFormData.work_under_convergence}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_under_convergence: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              असल्यास विभागाचे नाव
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.convergence_department}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, convergence_department: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="विभागाचे नाव प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              अभिसरणांतर्गत निधीचे विवरण
            </label>
            <textarea
              value={mahatmaGandhiFormData.convergence_fund_details}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, convergence_fund_details: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="निधीचे विवरण प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">मंगांराग्रारोहयो (MGNREGA)</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">अकुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.mgnrega_unskilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, mgnrega_unskilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">कुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.mgnrega_skilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, mgnrega_skilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">एकूण</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.mgnrega_total}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, mgnrega_total: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">अन्य विभाग (Other Department)</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">अकुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.other_dept_unskilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, other_dept_unskilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">कुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.other_dept_skilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, other_dept_skilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">एकूण</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.other_dept_total}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, other_dept_total: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workers and Attendance */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-600" />
          मजूर आणि हजेरी तपशील (Workers and Attendance Details)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              9] भेटीदरम्यान हजेरीपटावरील नोंद असलेल्या मजुरांची संख्या
            </label>
            <input
              type="number"
              value={mahatmaGandhiFormData.attendance_register_workers}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, attendance_register_workers: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="संख्या प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              10] प्रत्यक्ष कामावर उपस्थित मजुरांची संख्या
            </label>
            <input
              type="number"
              value={mahatmaGandhiFormData.actual_workers_present}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, actual_workers_present: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="संख्या प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Worker Facilities */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          11] कामाच्या ठिकाणी मजुरांसाठी असणाऱ्या सुविधा (Worker Facilities)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (i) मजुरांसाठी निवारा
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.shelter_for_workers}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, shelter_for_workers: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="निवारा तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (ii) प्रथमोपचार पेटी
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.first_aid_kit}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, first_aid_kit: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="प्रथमोपचार पेटी तपशील"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (iii) पिण्याचे पाणी
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.drinking_water}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, drinking_water: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="पिण्याचे पाणी तपशील"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (iv) मजुरांच्या लहान मुलांसाठी दाई
            </label>
            <input
              type="text"
              value={mahatmaGandhiFormData.childcare_for_workers_children}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, childcare_for_workers_children: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="दाई तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Work Status and Expenses */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-green-600" />
          कामाची स्थिती आणि खर्च (Work Status and Expenses)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              12] कामाची सद्यस्थिती
            </label>
            <textarea
              value={mahatmaGandhiFormData.current_work_status}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, current_work_status: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="कामाची सद्यस्थिती वर्णन करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">13] कामावर आतापर्यंत झालेला खर्च</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">अकुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.expenses_unskilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, expenses_unskilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">कुशल</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.expenses_skilled}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, expenses_skilled: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">एकूण</label>
                <input
                  type="text"
                  value={mahatmaGandhiFormData.expenses_total}
                  onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, expenses_total: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-green-600" />
          14] मजुरी आणि देयक तपशील (Wages and Payment Details)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (अ) यापूर्वीचा हजेरीपट बंद झाल्याचा दिनांक
            </label>
            <input
              type="date"
              value={mahatmaGandhiFormData.previous_attendance_closure_date}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, previous_attendance_closure_date: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (ब) या हजेरीपटाची मजुरी विहित कालावधीत मजुरांच्या खात्यात जमा झाली आहे काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.wages_deposited_timely}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, wages_deposited_timely: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (क) मजुरी प्रदानास विलंब झाल्यास, विलंब शुल्क प्रदान करण्यात आले काय?
              </label>
              <select
                value={mahatmaGandhiFormData.delay_compensation_provided}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, delay_compensation_provided: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Aadhaar and Job Cards */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-green-600" />
          15-16] आधार आणि जॉब कार्ड तपशील (Aadhaar and Job Card Details)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              15] (अ) मजुरांना आधार क्रमांक आधारित मजुरी प्रदान केली जात आहे काय ?
            </label>
            <select
              value={mahatmaGandhiFormData.aadhaar_based_payment}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, aadhaar_based_payment: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (ब) मजुरांच्या खात्यात मजुरी जमा झाली नसल्यास त्याची कारणे काय आहेत ?
            </label>
            <textarea
              value={mahatmaGandhiFormData.payment_failure_reasons}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, payment_failure_reasons: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="कारणे प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                16] (अ) जॉब कार्ड मजुरांकडे आहे काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.workers_have_job_cards}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, workers_have_job_cards: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (ब) जॉब कार्डवरील नोंदी अद्यावत केलेल्या आहेत काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.job_card_records_updated}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, job_card_records_updated: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation and Measurement */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          17-19] दस्तऐवजीकरण आणि मोजमाप (Documentation and Measurement)
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                17] कामाची वर्क फाईल (Work File/Case Record) अद्यावत आहे काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.work_file_updated}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_file_updated: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                18] कामाच्या ठिकाणी Citizen Information Board (CIB) आहे काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.citizen_information_board}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, citizen_information_board: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              19] कामाचे मोजमाप घेण्यात आले आहे काय ?
            </label>
            <select
              value={mahatmaGandhiFormData.work_measurement_done}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_measurement_done: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (अ) मोजमाप पुस्तिका क्रमांक
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.measurement_book_number}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, measurement_book_number: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="पुस्तिका क्रमांक प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (ब) अंदाजपत्रकप्रमाणे सर्व बाब निहाय मोजमापाच्या नोंदी घेण्यात आलेल्या आहेत काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.all_measurements_recorded}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, all_measurements_recorded: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (क) वरिष्ठ तांत्रिक अधिकाऱ्यांची कामाच्या मापांची आवश्यक तपासणी दाखल केली आहे काय?
              </label>
              <select
                value={mahatmaGandhiFormData.senior_technical_officer_check}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, senior_technical_officer_check: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                (घ) मोजमाप पुस्तिकेतील नोंदी व प्रत्यक्षात माप यामध्ये तफावत आहे काय ?
              </label>
              <select
                value={mahatmaGandhiFormData.measurement_discrepancy}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, measurement_discrepancy: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              >
                <option value="">निवडा</option>
                <option value="होय">होय</option>
                <option value="नाही">नाही</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (ङ) तफावत आढळलेल्या बाब निहाय नमूद करावे
            </label>
            <textarea
              value={mahatmaGandhiFormData.discrepancy_details}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, discrepancy_details: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="तफावत तपशील प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
          20-23] अंतिम मूल्यांकन (Final Assessment)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              20] कामाचे Geo-tagging झालेले आहे काय ?
            </label>
            <select
              value={mahatmaGandhiFormData.work_geotagged}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_geotagged: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">निवडा</option>
              <option value="होय">होय</option>
              <option value="नाही">नाही</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              21] कामा संदर्भात आढळलेल्या अन्य महत्वाच्या बाबी
            </label>
            <textarea
              value={mahatmaGandhiFormData.other_important_matters}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, other_important_matters: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="महत्वाच्या बाबी प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              22] कामाच्या सर्वसाधारण गुणवत्ता
            </label>
            <textarea
              value={mahatmaGandhiFormData.overall_work_quality}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, overall_work_quality: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="गुणवत्ता मूल्यांकन प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              23] कामाच्या उपयुक्ततेबाबत अभिप्राय
            </label>
            <textarea
              value={mahatmaGandhiFormData.work_utility_feedback}
              onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, work_utility_feedback: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              placeholder="उपयुक्ततेबाबत अभिप्राय प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                दिनांक
              </label>
              <input
                type="date"
                value={mahatmaGandhiFormData.inspection_date_final}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspection_date_final: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ठिकाण
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.inspection_location}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspection_location: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ठिकाण प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                तपासणी अधिकारी-याचे नाव
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.inspector_name_final}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspector_name_final: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पदनाम
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.inspector_designation_final}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspector_designation_final: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="पदनाम प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                कार्यालय
              </label>
              <input
                type="text"
                value={mahatmaGandhiFormData.inspector_office}
                onChange={(e) => setMahatmaGandhiFormData(prev => ({...prev, inspector_office: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="कार्यालय प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
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
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Upload MGNREGA Work Photos
        </h4>
        <p className="text-gray-600 mb-4">
          महात्मा गांधी रोजगार हमी योजना कामाची छायाचित्रे अपलोड करा
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
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
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
                  alt={`MGNREGA work photo ${index + 1}`}
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
                  alt={photo.description || `MGNREGA work photo ${index + 1}`}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
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
        return renderMahatmaGandhiForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return mahatmaGandhiFormData.inspection_date && mahatmaGandhiFormData.inspector_name && mahatmaGandhiFormData.work_name;
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
               t('fims.newInspection')} - महात्मा गांधी रोजगार हमी योजना
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              रोजगार हमी तपासणी
            </div>
            <div className={`${currentStep === 4 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl shadow-lg border-2 border-green-200 p-4 md:p-6 mb-4 md:mb-6">
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
            {currentStep === 4 ? (
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
                  className="px-3 md:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext()}
                className="px-4 md:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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