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
  School,
  Users,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface MumbaiNyayalayTapasaniFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface MumbaiNyayalayFormData {
  // Basic inspection information
  inspection_date: string;
  district_name: string;
  taluka_name: string;
  center_name: string;
  school_name: string;
  management_name: string;
  principal_name: string;
  udise_number: string;
  
  // Student and teacher data
  total_boys: number;
  total_girls: number;
  total_students: number;
  sanctioned_teachers: number;
  working_teachers: number;
  vacant_teachers: number;
  sanctioned_non_teaching: number;
  working_non_teaching: number;
  vacant_non_teaching: number;
  
  // Inspection details (16 points)
  building_construction_year: string;
  building_construction_year_status: string;
  building_construction_year_measures: string;
  building_construction_year_feedback: string;
  
  building_type_structure: string;
  building_type_structure_status: string;
  building_type_structure_measures: string;
  building_type_structure_feedback: string;
  
  classrooms_adequate: string;
  classrooms_adequate_status: string;
  classrooms_adequate_measures: string;
  classrooms_adequate_feedback: string;
  
  separate_toilets: string;
  separate_toilets_status: string;
  separate_toilets_measures: string;
  separate_toilets_feedback: string;
  
  cwsn_toilets: string;
  cwsn_toilets_status: string;
  cwsn_toilets_measures: string;
  cwsn_toilets_feedback: string;
  
  drinking_water: string;
  drinking_water_status: string;
  drinking_water_measures: string;
  drinking_water_feedback: string;
  
  boundary_wall: string;
  boundary_wall_status: string;
  boundary_wall_measures: string;
  boundary_wall_feedback: string;
  
  playground: string;
  playground_status: string;
  playground_measures: string;
  playground_feedback: string;
  
  kitchen_shed: string;
  kitchen_shed_status: string;
  kitchen_shed_measures: string;
  kitchen_shed_feedback: string;
  
  ramp_facility: string;
  ramp_facility_status: string;
  ramp_facility_measures: string;
  ramp_facility_feedback: string;
  
  electricity: string;
  electricity_status: string;
  electricity_measures: string;
  electricity_feedback: string;
  
  seating_arrangement: string;
  seating_arrangement_status: string;
  seating_arrangement_measures: string;
  seating_arrangement_feedback: string;
  
  cleanliness: string;
  cleanliness_status: string;
  cleanliness_measures: string;
  cleanliness_feedback: string;
  
  illegal_use: string;
  illegal_use_status: string;
  illegal_use_measures: string;
  illegal_use_feedback: string;
  
  encroachment: string;
  encroachment_status: string;
  encroachment_measures: string;
  encroachment_feedback: string;
  
  notable_work: string;
  notable_work_status: string;
  notable_work_measures: string;
  notable_work_feedback: string;
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
}

export const MumbaiNyayalayTapasaniForm: React.FC<MumbaiNyayalayTapasaniFormProps> = ({
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

  // Mumbai Nyayalay form data
  const [mumbaiNyayalayFormData, setMumbaiNyayalayFormData] = useState<MumbaiNyayalayFormData>({
    inspection_date: '',
    district_name: '',
    taluka_name: '',
    center_name: '',
    school_name: '',
    management_name: '',
    principal_name: '',
    udise_number: '',
    total_boys: 0,
    total_girls: 0,
    total_students: 0,
    sanctioned_teachers: 0,
    working_teachers: 0,
    vacant_teachers: 0,
    sanctioned_non_teaching: 0,
    working_non_teaching: 0,
    vacant_non_teaching: 0,
    building_construction_year: '',
    building_construction_year_status: '',
    building_construction_year_measures: '',
    building_construction_year_feedback: '',
    building_type_structure: '',
    building_type_structure_status: '',
    building_type_structure_measures: '',
    building_type_structure_feedback: '',
    classrooms_adequate: '',
    classrooms_adequate_status: '',
    classrooms_adequate_measures: '',
    classrooms_adequate_feedback: '',
    separate_toilets: '',
    separate_toilets_status: '',
    separate_toilets_measures: '',
    separate_toilets_feedback: '',
    cwsn_toilets: '',
    cwsn_toilets_status: '',
    cwsn_toilets_measures: '',
    cwsn_toilets_feedback: '',
    drinking_water: '',
    drinking_water_status: '',
    drinking_water_measures: '',
    drinking_water_feedback: '',
    boundary_wall: '',
    boundary_wall_status: '',
    boundary_wall_measures: '',
    boundary_wall_feedback: '',
    playground: '',
    playground_status: '',
    playground_measures: '',
    playground_feedback: '',
    kitchen_shed: '',
    kitchen_shed_status: '',
    kitchen_shed_measures: '',
    kitchen_shed_feedback: '',
    ramp_facility: '',
    ramp_facility_status: '',
    ramp_facility_measures: '',
    ramp_facility_feedback: '',
    electricity: '',
    electricity_status: '',
    electricity_measures: '',
    electricity_feedback: '',
    seating_arrangement: '',
    seating_arrangement_status: '',
    seating_arrangement_measures: '',
    seating_arrangement_feedback: '',
    cleanliness: '',
    cleanliness_status: '',
    cleanliness_measures: '',
    cleanliness_feedback: '',
    illegal_use: '',
    illegal_use_status: '',
    illegal_use_measures: '',
    illegal_use_feedback: '',
    encroachment: '',
    encroachment_status: '',
    encroachment_measures: '',
    encroachment_feedback: '',
    notable_work: '',
    notable_work_status: '',
    notable_work_measures: '',
    notable_work_feedback: '',
    inspector_name: '',
    inspector_designation: ''
  });

  // Get mumbai nyayalay category
  const mumbaiNyayalayCategory = categories.find(cat => cat.form_type === 'mumbai_nyayalay');

  useEffect(() => {
    if (mumbaiNyayalayCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: mumbaiNyayalayCategory.id
      }));
    }
  }, [mumbaiNyayalayCategory]);

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
        setMumbaiNyayalayFormData({
          ...mumbaiNyayalayFormData,
          ...editingInspection.form_data
        });
      }
    }
  }, [editingInspection]);

  // Auto-calculate total students
  useEffect(() => {
    const total = mumbaiNyayalayFormData.total_boys + mumbaiNyayalayFormData.total_girls;
    setMumbaiNyayalayFormData(prev => ({ ...prev, total_students: total }));
  }, [mumbaiNyayalayFormData.total_boys, mumbaiNyayalayFormData.total_girls]);

  // Auto-calculate vacant positions
  useEffect(() => {
    const vacantTeachers = mumbaiNyayalayFormData.sanctioned_teachers - mumbaiNyayalayFormData.working_teachers;
    const vacantNonTeaching = mumbaiNyayalayFormData.sanctioned_non_teaching - mumbaiNyayalayFormData.working_non_teaching;
    setMumbaiNyayalayFormData(prev => ({ 
      ...prev, 
      vacant_teachers: Math.max(0, vacantTeachers),
      vacant_non_teaching: Math.max(0, vacantNonTeaching)
    }));
  }, [mumbaiNyayalayFormData.sanctioned_teachers, mumbaiNyayalayFormData.working_teachers, 
      mumbaiNyayalayFormData.sanctioned_non_teaching, mumbaiNyayalayFormData.working_non_teaching]);

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
        const fileName = `mumbai_nyayalay_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `मुंबई न्यायालय तपासणी फोटो ${i + 1}`,
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
    return `MNY-${year}${month}${day}-${time}`;
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
            form_data: mumbaiNyayalayFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;
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
            form_data: mumbaiNyayalayFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;
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
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
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
        <School className="h-5 w-5 mr-2 text-red-600" />
        मूलभूत माहिती (Basic Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणी दिनांक *
          </label>
          <input
            type="date"
            value={mumbaiNyayalayFormData.inspection_date}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, inspection_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            जिल्हा नाव *
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.district_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, district_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="जिल्हा नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तालुक्याचे नाव *
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.taluka_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, taluka_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="तालुक्याचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            केंद्राचे नाव
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.center_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, center_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="केंद्राचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचे नाव *
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.school_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, school_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="शाळेचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            व्यवस्थापनाचे नाव- जिल्हा परिषद / म.न.पा / न.पा.
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.management_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, management_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="व्यवस्थापनाचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            मुख्याध्यापकाचे नाव
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.principal_name}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, principal_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="मुख्याध्यापकाचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            युडायस नं.
          </label>
          <input
            type="text"
            value={mumbaiNyayalayFormData.udise_number}
            onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, udise_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="युडायस नं. प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Student and Teacher Data Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-red-600" />
          विद्यार्थी आणि शिक्षक संख्या (Student and Teacher Count)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-black text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">विद्यार्थी संख्या एकूण मुले</th>
                <th className="border border-black p-2">विद्यार्थी संख्या एकूण मुली</th>
                <th className="border border-black p-2">एकूण विद्यार्थी संख्या</th>
                <th className="border border-black p-2">एकूण मंजूर शिक्षक संख्या</th>
                <th className="border border-black p-2">कार्यरत शिक्षक संख्या</th>
                <th className="border border-black p-2">रिक्त शिक्षक संख्या</th>
                <th className="border border-black p-2">एकूण मंजूर शिक्षकेत्तर कर्मचारी संख्या</th>
                <th className="border border-black p-2">एकूण कार्यरत शिक्षकेत्तर कर्मचारी संख्या</th>
                <th className="border border-black p-2">रिक्त शिक्षकेत्तर कर्मचारी संख्या</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.total_boys}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, total_boys: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.total_girls}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, total_girls: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2 bg-gray-100">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.total_students}
                    readOnly
                    className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded"
                  />
                </td>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.sanctioned_teachers}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, sanctioned_teachers: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.working_teachers}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, working_teachers: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2 bg-gray-100">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.vacant_teachers}
                    readOnly
                    className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded"
                  />
                </td>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.sanctioned_non_teaching}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, sanctioned_non_teaching: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.working_non_teaching}
                    onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, working_non_teaching: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                    disabled={isViewMode}
                  />
                </td>
                <td className="border border-black p-2 bg-gray-100">
                  <input
                    type="number"
                    value={mumbaiNyayalayFormData.vacant_non_teaching}
                    readOnly
                    className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded"
                  />
                </td>
              </tr>
            </tbody>
          </table>
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

  const renderMumbaiNyayalayForm = () => {
    const inspectionPoints = [
  { key: 'building_construction_year_1', title: '1) शाळा इमारत बांधकाम वर्ष.' },

  { key: 'building_type_structure_1', title: '2) (अ) शाळा बांधकाम प्रकार : 1.आर.सी.सी.बांधकाम' },
  { key: 'building_type_structure_2', title: '2) पत्र्याचे बांधकाम / कौलारू बांधकाम' },
  { key: 'building_type_structure_3', title: '(ब) शाळा बांधकाम स्थिती: 1.सुस्थितीत आहे काय?' },
  { key: 'building_type_structure_4', title: '2.दुरुस्तीची गरज आहे का? असल्यास काय दुरुस्ती' },

  { key: 'classrooms_adequate_1', title: '3) विद्यार्थ्यांच्या प्रमाणात वर्ग खोल्या आहेत का?' },
  { key: 'classrooms_adequate_2', title: '१. आवश्यक खोल्यांची संख्या.' },
  { key: 'classrooms_adequate_3', title: '२. उपलब्ध खोल्यांची संख्या' },
  { key: 'classrooms_adequate_4', title: '३. नव्याने आवश्यक असणाऱ्या खोल्यांची संख्या' },
  { key: 'classrooms_adequate_5', title: '४. खोल्या सुरक्षितीत आहे का?' },
  { key: 'classrooms_adequate_6', title: '५. दुरुस्ती आवश्यक आहे का? असल्यास काय दुरुस्ती?' },

  { key: 'separate_toilets_1', title: '4) मुलांसाठी व मुलींसाठी स्वतंत्र स्वच्छतागृह उपलब्ध आहे का ?' },
  { key: 'separate_toilets_2', title: '१. विद्यार्थी संख्येच्या प्रमाणात स्वच्छतागृहे उपलब्ध आहे का ?' },
  { key: 'separate_toilets_3', title: '२. शौचालयांची नियमित स्वच्छता होते का ?' },
  { key: 'separate_toilets_4', title: '३. शौचालयांमध्ये पाण्याची मुलभूत सोय आहे का ?' },

  { key: 'cwsn_toilets_1', title: '5) विशेष गरजा असणाऱ्या विद्यार्थ्यांसाठी (CWSN) स्वच्छतागृह आहे का ?' },
  { key: 'cwsn_toilets_2', title: '१. शौचालयाची नियमित स्वच्छता होते का ?' },
  { key: 'cwsn_toilets_3', title: '२. शौचालयामध्ये पाण्याची मुलभूत सोय आहे का ?' },

  { key: 'drinking_water_1', title: '6) मुलांना पिण्याचे स्वच्छ पाणी व वापरासाठी पाणी पुरेशा प्रमाणात उपलब्ध आहे काय ?' },
  { key: 'drinking_water_2', title: '१. पाणी साठवण्यासाठी टाकी उपलब्ध आहे का ? असल्यास क्षमता (लिटर मध्ये)' },
  { key: 'drinking_water_3', title: '२. पाणी साठवणुकीच्या प्रकार (पिपा, जार, इ.)' },
  { key: 'drinking_water_4', title: '३. पाणी साठवणुकीच्या टाकीची स्वच्छता करणेत येते का? किती दिवसांनी ?' },

  { key: 'boundary_wall_1', title: '7) शाळेला संरक्षक भिंत आहे का ?' },
  { key: 'boundary_wall_2', title: '१. पक्की भिंत / तारेचे कुंपण ?' },
  { key: 'boundary_wall_3', title: '२. संरक्षक भिंत सुस्थितीत आहे का ?' },

  { key: 'playground_1', title: '8) मुलांना खेळण्यासाठी मैदान' },
  { key: 'playground_2', title: '१. मैदानाची स्थिती,' },
  { key: 'playground_3', title: '२. स्वतःचे / खाजगी जागा / सार्वजनिक' },
  { key: 'playground_4', title: '३. क्षेत्रफळ किती ?' },

  { key: 'kitchen_shed_1', title: '9) किचनशेड उपलब्ध आहे का ? व सद्यस्थिती.' },
  { key: 'kitchen_shed_2', title: '१. स्वच्छता आहे का ?' },

  { key: 'ramp_facility_1', title: '10) उताराचा रस्ता (रॅम्प) आहे का ?' },
  { key: 'ramp_facility_2', title: '१. निकषा प्रमाणे आहे का ? (उतार १:१२)' },
  { key: 'ramp_facility_3', title: '२. दोन्ही बाजूस कठडे आहेत का ?' },

  { key: 'electricity_1', title: '11) शाळेमध्ये लाईटची सोय आहे का ?' },
  { key: 'electricity_2', title: '१. सर्व खोल्यांमध्ये वीज उपलब्ध आहे का ?' },
  { key: 'electricity_3', title: '२. वीज बिल भरणा न केल्यामुळे बंद आहे काय ?' },
  { key: 'electricity_4', title: '३. वीज जोडणी / दुरुस्ती आवश्यक असणाऱ्या खोल्यांची संख्या.' },
  { key: 'electricity_5', title: '४.शाळेचे पंखे व लाईट्स सुस्थितीत आहेत का ?' },

  { key: 'seating_arrangement_1', title: '12) विद्यार्थ्यांना बसण्यासाठी बैठक व्यवस्था.' },
  { key: 'seating_arrangement_2', title: '१. बेंचवर / फरशीवर / जमिनीवर,' },
  { key: 'seating_arrangement_3', title: '२. उपलब्ध बेंच संख्या' },
  { key: 'seating_arrangement_4', title: '३. आवश्यक बेंच संख्या' },
  { key: 'seating_arrangement_5', title: '४. कमी असणाऱ्या बेंच संख्या' },
  { key: 'seating_arrangement_6', title: '५. मुलांना बसण्याचे बेंचची स्थिती काय आहे?' },

  { key: 'cleanliness_1', title: '13) शाळा व शाळा परिसर स्वच्छ आहे का?' },
  { key: 'cleanliness_2', title: '१. वर्ग खोल्या,' },
  { key: 'cleanliness_3', title: '२. इमारत' },
  { key: 'cleanliness_4', title: '३. मैदान / शाळेचा परिसर' },
  { key: 'cleanliness_5', title: '४.वर्गखोल्यांची रंगरंगोटी आहे का ?' },
  { key: 'cleanliness_6', title: '५.वर्गखोल्यांचा वापर शैक्षणिक कामकाजासाठीच होतो का ? इतर कामांसाठी उदा. शेळ्या बांधणे, स्टोअर रूम अन्य व्यक्तीने अतिक्रमण इत्यादी' },

  { key: 'illegal_use_1', title: '14) शाळा इमारतींचा / शाळा परिसराचा वापर नागरिकांकडून अवैध कामांसाठी करण्यात येतो का ?' },
  { key: 'illegal_use_2', title: '१. कायदा व सुव्यवस्थेचा प्रश्न उद्भवतो का ? पोलिस प्रशासनाने दखल घेऊन बंदोबस्त करणे आवश्यक आहे का ?' },

  { key: 'encroachment', title: '15) शाळेच्या इमारत व जागेवर अतिक्रमण झाले आहे का ? असल्यास काय स्थिती.' },
  { key: 'notable_work', title: '16) भौतिक सुविधा व इतर बाबींबाबत उल्लेखनीय काम असल्यास उल्लेख करावा.' }
];


    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          मा. उच्च न्यायालय, मुंबई तपासणी प्रपत्र (Hon. High Court, Mumbai Inspection Form)
        </h3>

        {/* Inspection Details Table */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-red-600" />
            तपासणी तपशील (Inspection Details)
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-black text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2">अ.क्र</th>
                  <th className="border border-black p-2">तपशील</th>
                  <th className="border border-black p-2">सध्यस्थिती</th>
                  <th className="border border-black p-2">करावयाच्या उपाययोजना</th>
                  <th className="border border-black p-2">अभिप्राय</th>
                </tr>
              </thead>
              <tbody>
                {inspectionPoints.map((point, index) => (
                  <tr key={point.key}>
                    <td className="border border-black p-2 align-top">{index + 1}</td>
                    <td className="border border-black p-2 align-top whitespace-pre-wrap text-xs">
                      {point.title}
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        value={mumbaiNyayalayFormData[`${point.key}_status` as keyof MumbaiNyayalayFormData] as string}
                        onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, [`${point.key}_status`]: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-xs"
                        rows={3}
                        placeholder="सध्यस्थिती"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        value={mumbaiNyayalayFormData[`${point.key}_measures` as keyof MumbaiNyayalayFormData] as string}
                        onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, [`${point.key}_measures`]: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-xs"
                        rows={3}
                        placeholder="उपाययोजना"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        value={mumbaiNyayalayFormData[`${point.key}_feedback` as keyof MumbaiNyayalayFormData] as string}
                        onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, [`${point.key}_feedback`]: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-xs"
                        rows={3}
                        placeholder="अभिप्राय"
                        disabled={isViewMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspector Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-red-600" />
            निरीक्षकाची माहिती (Inspector Information)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                निरीक्षकाचे नाव
              </label>
              <input
                type="text"
                value={mumbaiNyayalayFormData.inspector_name}
                onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, inspector_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                value={mumbaiNyayalayFormData.inspector_designation}
                onChange={(e) => setMumbaiNyayalayFormData(prev => ({...prev, inspector_designation: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="पदनाम प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('fims.photoDocumentation')}
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Upload School Inspection Photos
        </h4>
        <p className="text-gray-600 mb-4">
          शाळेच्या भौतिक सुविधांच्या तपासणीसाठी फोटो अपलोड करा
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
                  alt={`School inspection photo ${index + 1}`}
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
                  alt={photo.description || `School inspection photo ${index + 1}`}
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
        return renderMumbaiNyayalayForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return mumbaiNyayalayFormData.inspection_date && mumbaiNyayalayFormData.district_name && mumbaiNyayalayFormData.taluka_name && mumbaiNyayalayFormData.school_name;
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
            <h1 className="text-lg md:text-xl font-bold text-gray-900 text-center">
              {editingInspection?.mode === 'view' ? t('fims.viewInspection') : 
               editingInspection?.mode === 'edit' ? t('fims.editInspection') : 
               t('fims.newInspection')} - मुंबई न्यायालय तपासणी प्रपत्र
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              न्यायालय तपासणी
            </div>
            <div className={`${currentStep === 4 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
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
                  className="px-3 md:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                //disabled={!canProceedToNext() || isViewMode}
                disabled={!isViewMode && !canProceedToNext()}
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