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
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ZPDarMahinyalaFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface ZPDarMahinyalaFormData {
  // Basic information
  visit_date: string;
  
  // Table data for up to 3 rows
  row_1_district_name: string;
  row_1_project_name: string;
  row_1_total_anganwadi_centers: string;
  row_1_total_supervisors: string;
  row_1_supervisor_target_achieved: string;
  row_1_bavipraa_target_achieved: string;
  row_1_dpo_project_visit_details: string;
  
  row_2_district_name: string;
  row_2_project_name: string;
  row_2_total_anganwadi_centers: string;
  row_2_total_supervisors: string;
  row_2_supervisor_target_achieved: string;
  row_2_bavipraa_target_achieved: string;
  row_2_dpo_project_visit_details: string;
  
  row_3_district_name: string;
  row_3_project_name: string;
  row_3_total_anganwadi_centers: string;
  row_3_total_supervisors: string;
  row_3_supervisor_target_achieved: string;
  row_3_bavipraa_target_achieved: string;
  row_3_dpo_project_visit_details: string;
  
  // Additional notes
  additional_notes: string;
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
  inspection_date: string;
}

export const ZPDarMahinyalaSadarKaryachePrapatraForm: React.FC<ZPDarMahinyalaFormProps> = ({
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

  // ZP Dar Mahinyala form data
  const [zpDarMahinyalaFormData, setZpDarMahinyalaFormData] = useState<ZPDarMahinyalaFormData>({
    visit_date: '',
    row_1_district_name: '',
    row_1_project_name: '',
    row_1_total_anganwadi_centers: '',
    row_1_total_supervisors: '',
    row_1_supervisor_target_achieved: '',
    row_1_bavipraa_target_achieved: '',
    row_1_dpo_project_visit_details: '',
    row_2_district_name: '',
    row_2_project_name: '',
    row_2_total_anganwadi_centers: '',
    row_2_total_supervisors: '',
    row_2_supervisor_target_achieved: '',
    row_2_bavipraa_target_achieved: '',
    row_2_dpo_project_visit_details: '',
    row_3_district_name: '',
    row_3_project_name: '',
    row_3_total_anganwadi_centers: '',
    row_3_total_supervisors: '',
    row_3_supervisor_target_achieved: '',
    row_3_bavipraa_target_achieved: '',
    row_3_dpo_project_visit_details: '',
    additional_notes: '',
    inspector_name: '',
    inspector_designation: '',
    inspection_date: ''
  });

  // Get ZP Dar Mahinyala category
  const zpDarMahinyalaCategory = categories.find(cat => cat.form_type === 'zp_dar_mahinyala');

  useEffect(() => {
    if (zpDarMahinyalaCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: zpDarMahinyalaCategory.id
      }));
    }
  }, [zpDarMahinyalaCategory]);

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
        setZpDarMahinyalaFormData({
          ...zpDarMahinyalaFormData,
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
        const fileName = `zp_dar_mahinyala_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `ZP Dar Mahinyala inspection photo ${i + 1}`,
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
    return `ZPM-${year}${month}${day}-${time}`;
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
            form_data: zpDarMahinyalaFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Delete existing bhet_praptra records for this inspection
        const { error: deleteError } = await supabase
          .from('bhet_praptra')
          .delete()
          .eq('inspection_id', editingInspection.id);

        if (deleteError) throw deleteError;

        // Insert new bhet_praptra records for each row
        const bhetPraptraRecords = [];
        for (let i = 1; i <= 3; i++) {
          const districtName = zpDarMahinyalaFormData[`row_${i}_district_name` as keyof ZPDarMahinyalaFormData] as string;
          const projectName = zpDarMahinyalaFormData[`row_${i}_project_name` as keyof ZPDarMahinyalaFormData] as string;
          
          // Only create record if district name or project name is provided
          if (districtName || projectName) {
            const visitDetails = zpDarMahinyalaFormData[`row_${i}_dpo_project_visit_details` as keyof ZPDarMahinyalaFormData] as string;
            
            // Parse visit details to extract project visit status and total centers visited
            let projectVisitStatus = 'नाही';
            let totalCentersVisited = 0;
            
            if (visitDetails) {
              // Try to extract "होय" or "नाही" from the text
              if (visitDetails.toLowerCase().includes('होय')) {
                projectVisitStatus = 'होय';
              }
              
              // Try to extract numbers from the text for centers visited
              const numberMatch = visitDetails.match(/(\d+)/);
              if (numberMatch) {
                totalCentersVisited = parseInt(numberMatch[1], 10);
              }
            }
            
            bhetPraptraRecords.push({
              inspection_id: editingInspection.id,
              row_no: i,
              district_name: districtName || '',
              project_name: projectName || '',
              total_anganwadi_centers: parseInt(zpDarMahinyalaFormData[`row_${i}_total_anganwadi_centers` as keyof ZPDarMahinyalaFormData] as string) || 0,
              total_supervisors: parseInt(zpDarMahinyalaFormData[`row_${i}_total_supervisors` as keyof ZPDarMahinyalaFormData] as string) || 0,
              supervisors_achieved_centers_count: parseInt(zpDarMahinyalaFormData[`row_${i}_supervisor_target_achieved` as keyof ZPDarMahinyalaFormData] as string) || 0,
              bavipra_achieved_centers_count: parseInt(zpDarMahinyalaFormData[`row_${i}_bavipraa_target_achieved` as keyof ZPDarMahinyalaFormData] as string) || 0,
              dpo_visit_details: visitDetails || '',
              project_visit_status: projectVisitStatus,
              total_centers_visited: totalCentersVisited
            });
          }
        }

        if (bhetPraptraRecords.length > 0) {
          const { error: bhetPraptraError } = await supabase
            .from('bhet_praptra')
            .insert(bhetPraptraRecords);

          if (bhetPraptraError) throw bhetPraptraError;
        }
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
            form_data: zpDarMahinyalaFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Insert bhet_praptra records for each row
        const bhetPraptraRecords = [];
        for (let i = 1; i <= 3; i++) {
          const districtName = zpDarMahinyalaFormData[`row_${i}_district_name` as keyof ZPDarMahinyalaFormData] as string;
          const projectName = zpDarMahinyalaFormData[`row_${i}_project_name` as keyof ZPDarMahinyalaFormData] as string;
          
          // Only create record if district name or project name is provided
          if (districtName || projectName) {
            const visitDetails = zpDarMahinyalaFormData[`row_${i}_dpo_project_visit_details` as keyof ZPDarMahinyalaFormData] as string;
            
            // Parse visit details to extract project visit status and total centers visited
            let projectVisitStatus = 'नाही';
            let totalCentersVisited = 0;
            
            if (visitDetails) {
              // Try to extract "होय" or "नाही" from the text
              if (visitDetails.toLowerCase().includes('होय')) {
                projectVisitStatus = 'होय';
              }
              
              // Try to extract numbers from the text for centers visited
              const numberMatch = visitDetails.match(/(\d+)/);
              if (numberMatch) {
                totalCentersVisited = parseInt(numberMatch[1], 10);
              }
            }
            
            bhetPraptraRecords.push({
              inspection_id: inspectionResult.id,
              row_no: i,
              district_name: districtName || '',
              project_name: projectName || '',
              total_anganwadi_centers: parseInt(zpDarMahinyalaFormData[`row_${i}_total_anganwadi_centers` as keyof ZPDarMahinyalaFormData] as string) || 0,
              total_supervisors: parseInt(zpDarMahinyalaFormData[`row_${i}_total_supervisors` as keyof ZPDarMahinyalaFormData] as string) || 0,
              supervisors_achieved_centers_count: parseInt(zpDarMahinyalaFormData[`row_${i}_supervisor_target_achieved` as keyof ZPDarMahinyalaFormData] as string) || 0,
              bavipra_achieved_centers_count: parseInt(zpDarMahinyalaFormData[`row_${i}_bavipraa_target_achieved` as keyof ZPDarMahinyalaFormData] as string) || 0,
              dpo_visit_details: visitDetails || '',
              project_visit_status: projectVisitStatus,
              total_centers_visited: totalCentersVisited
            });
          }
        }

        if (bhetPraptraRecords.length > 0) {
          const { error: bhetPraptraError } = await supabase
            .from('bhet_praptra')
            .insert(bhetPraptraRecords);

          if (bhetPraptraError) throw bhetPraptraError;
        }
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
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
        मूलभूत माहिती (Basic Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेट दिनांक *
          </label>
          <input
            type="date"
            value={zpDarMahinyalaFormData.visit_date}
            onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, visit_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणी दिनांक
          </label>
          <input
            type="date"
            value={zpDarMahinyalaFormData.inspection_date}
            onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, inspection_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Inspector Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-indigo-600" />
          निरीक्षकाची माहिती (Inspector Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              निरीक्षकाचे नाव
            </label>
            <input
              type="text"
              value={zpDarMahinyalaFormData.inspector_name}
              onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, inspector_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              value={zpDarMahinyalaFormData.inspector_designation}
              onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, inspector_designation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="पदनाम प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-t-lg">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderZPDarMahinyalaForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        दर महिन्याला सादर करावयाचे प्रपत्र (जिल्हा परिषद कार्यालयासाठी)
      </h3>

      {/* Table Data for 3 rows */}
      {[1, 2, 3].map((rowNum) => (
        <div key={rowNum} className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
            प्रकल्प {rowNum} तपशील (Project {rowNum} Details)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                जिल्ह्याचे नाव
              </label>
              <input
                type="text"
                value={zpDarMahinyalaFormData[`row_${rowNum}_district_name` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_district_name`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="जिल्ह्याचे नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                अधिनस्त ग्रामीण / आदिवासी प्रकल्पाचे नाव
              </label>
              <input
                type="text"
                value={zpDarMahinyalaFormData[`row_${rowNum}_project_name` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_project_name`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="प्रकल्पाचे नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रकल्पांतील अंगणवाडी केंद्रांची एकूण संख्या
              </label>
              <input
                type="number"
                value={zpDarMahinyalaFormData[`row_${rowNum}_total_anganwadi_centers` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_total_anganwadi_centers`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रकल्पातील पर्यवेक्षकांची एकूण संख्या
              </label>
              <input
                type="number"
                value={zpDarMahinyalaFormData[`row_${rowNum}_total_supervisors` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_total_supervisors`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पर्यवेक्षकांनी उद्दिष्ट साध्य केलेल्या अंगणवाडी केंद्रांची संख्या
              </label>
              <input
                type="number"
                value={zpDarMahinyalaFormData[`row_${rowNum}_supervisor_target_achieved` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_supervisor_target_achieved`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                बाविप्रअ यांनी उद्दिष्ट साध्य केलेल्या अंगणवाडी केंद्रांची संख्या
              </label>
              <input
                type="number"
                value={zpDarMahinyalaFormData[`row_${rowNum}_bavipraa_target_achieved` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_bavipraa_target_achieved`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                जिल्हा कार्यक्रम अधिकारी (मबावि) प्रकल्प भेट व अंगणवाडी भेटीचे तपशील
              </label>
              <textarea
                value={zpDarMahinyalaFormData[`row_${rowNum}_dpo_project_visit_details` as keyof ZPDarMahinyalaFormData] as string}
                onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, [`row_${rowNum}_dpo_project_visit_details`]: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="प्रकल्प भेट (होय/नाही) व एकूण अंगणवाडी केंद्र भेटीची संख्या"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Additional Notes */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-indigo-600" />
          अतिरिक्त टिप्पण्या (Additional Notes)
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शासन निर्णयानुसार तपासणी संबंधी टिप्पण्या
          </label>
          <textarea
            value={zpDarMahinyalaFormData.additional_notes}
            onChange={(e) => setZpDarMahinyalaFormData(prev => ({...prev, additional_notes: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="जिल्ह्याच्या अधिनस्त ग्रामीण / आदिवासी प्रकल्पातील संबंधित बाल विकास प्रकल्प अधिकारी व पर्यवेक्षिका यांनी दि. ११/९/२०१२ च्या शासन निर्णयात नमूद केल्याप्रमाणे अंगणवाडी केंद्र तपासणीचे उद्दिष्ट साध्य केलेले आहे व त्याची तपासणी जिल्हा कार्यालयामार्फत करण्यात आलेली आहे."
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
          Upload ZP Monthly Report Photos
        </h4>
        <p className="text-gray-600 mb-4">
          Upload photos related to the monthly ZP report for documentation
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
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
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
                  alt={`ZP report photo ${index + 1}`}
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
                  alt={photo.description || `ZP report photo ${index + 1}`}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
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
        return renderZPDarMahinyalaForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return zpDarMahinyalaFormData.visit_date;
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
               t('fims.newInspection')} - दर महिन्याला सादर करावयाचे प्रपत्र
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              ZP मासिक प्रपत्र
            </div>
            <div className={`${currentStep === 4 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl shadow-lg border-2 border-indigo-200 p-4 md:p-6 mb-4 md:mb-6">
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
                  className="px-3 md:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
                </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
                className="px-4 md:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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