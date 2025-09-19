// BandhakamVibhag1Form.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Camera,
  Save,
  Send,
  Calendar,
  FileText,
  Settings,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface BandhakamVibhag1FormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface BandhakamFormData {
  // Basic inspection information
  visit_date: string;
  work_name: string;
  account_head: string;
  admin_approval_number: string;
  admin_approval_date: string;
  admin_approval_amount: string;
  technical_approval_number: string;
  technical_approval_date: string;
  road_length_building_area: string;
  contract_number: string;
  contract_amount: string;
  contract_percentage: string;
  contractor_name: string;
  work_start_order_number: string;
  work_start_date: string;
  work_duration: string;
  extension_details: string;
  work_scope: string;
  current_status: string;
  measurement_book_details: string;
  payment_status: string;
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
  visit_date_inspector: string;
}

export const BandhakamVibhag1Form: React.FC<BandhakamVibhag1FormProps> = ({
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
    location_accuracy: null as number | null,
  });

  // Bandhakam form data
  const [bandhakamFormData, setBandhakamFormData] = useState<BandhakamFormData>({
    visit_date: '',
    work_name: '',
    account_head: '',
    admin_approval_number: '',
    admin_approval_date: '',
    admin_approval_amount: '',
    technical_approval_number: '',
    technical_approval_date: '',
    road_length_building_area: '',
    contract_number: '',
    contract_amount: '',
    contract_percentage: '',
    contractor_name: '',
    work_start_order_number: '',
    work_start_date: '',
    work_duration: '',
    extension_details: '',
    work_scope: '',
    current_status: '',
    measurement_book_details: '',
    payment_status: '',
    inspector_name: '',
    inspector_designation: '',
    visit_date_inspector: ''
  });

  // Get bandhakam inspection category
  const bandhakamCategory = categories.find(cat => cat.form_type === 'bandhakam_vibhag');

  useEffect(() => {
    if (bandhakamCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: bandhakamCategory.id
      }));
    }
  }, [bandhakamCategory, categories]);

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
        location_accuracy: editingInspection.location_accuracy,
      });

      // Load form data if available
      if (editingInspection.form_data) {
        setBandhakamFormData(prev => ({
          ...prev,
          ...editingInspection.form_data
        }));
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
    const files = Array.from(event.target.files!);
    if (uploadedPhotos.length + files.length > 5) {
      alert(t('fims.maxPhotosAllowed'));
      return;
    }
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `BD-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      let inspectionResult: any;

      if (editingInspection && editingInspection.id) {
        // Convert empty strings to null for database compatibility
        const updateInspectionData = {
          ...inspectionData,
          planned_date: inspectionData.planned_date || null,
          category_id: inspectionData.category_id || bandhakamCategory?.id || null
        };

        // Validate required UUID fields
        if (!updateInspectionData.category_id) {
          throw new Error('Category is required. Please select a valid inspection category.');
        }

        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fims_inspections')
          .update({
            location_name: updateInspectionData.location_name,
            latitude: updateInspectionData.latitude,
            longitude: updateInspectionData.longitude,
            location_accuracy: updateInspectionData.location_accuracy,
            address: updateInspectionData.address,
            planned_date: updateInspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: bandhakamFormData
          })
          .eq('id', editingInspection.id);

        if (updateError) throw updateError;
        inspectionResult = { id: editingInspection.id };
      } else {
        // Convert empty strings to null for database compatibility
        const createInspectionData = {
          ...inspectionData,
          planned_date: inspectionData.planned_date || null,
          category_id: inspectionData.category_id || bandhakamCategory?.id || null
        };

        // Validate required UUID fields
        if (!createInspectionData.category_id) {
          throw new Error('Category is required. Please select a valid inspection category.');
        }

        // Create new inspection
        const inspectionNumber = generateInspectionNumber();
        
        const { data: createResult, error: createError } = await supabase
          .from('fims_inspections')
          .insert({
            inspection_number: inspectionNumber,
            category_id: createInspectionData.category_id,
            inspector_id: user.id,
            location_name: createInspectionData.location_name,
            latitude: createInspectionData.latitude,
            longitude: createInspectionData.longitude,
            location_accuracy: createInspectionData.location_accuracy,
            address: createInspectionData.address,
            planned_date: createInspectionData.planned_date,
            inspection_date: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            form_data: bandhakamFormData
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
        ? (isUpdate ? t('fims.draftUpdatedSuccessfully') : t('fims.draftSavedSuccessfully'))
        : (isUpdate ? t('fims.inspectionUpdatedSuccessfully') : t('fims.inspectionSubmittedSuccessfully'));
      
      alert(message);
      onInspectionCreated();
      onBack();

    } catch (error: any) {
      console.error('Error saving inspection:', error);
      alert(`Error saving inspection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhotosToSupabase = async (inspectionId: string) => {
    if (uploadedPhotos.length === 0) return;
    
    setIsUploading(true);
    try {
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const file = uploadedPhotos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `bandhakam_vibhag_${inspectionId}_${Date.now()}_${i}.${fileExt}`;
        
        // Upload to field-visit-images bucket in Supabase Storage
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
            description: `Bandhakam Vibhag inspection photo ${i + 1}`,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map(step => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
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

  const renderBandhakamForm = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4 font-sans text-[16px] leading-relaxed">
        <h2 className="text-xl font-bold text-center underline">प्रपत्र-1</h2>
        <h3 className="text-center font-semibold">
          जिल्हा परिषद (बांधकाम विभाग) चंद्रपूर उपविभाग, चंद्रपूर <br />
          कडील कामाची पाहणी अहवाल
        </h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="table-auto w-full border border-black mt-6 text-left">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 w-12">अ.क्र.</th>
              <th className="border border-black px-2 py-1 w-1/2">बाब</th>
              <th className="border border-black px-2 py-1">माहिती</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "मंजूर अंदाजपत्रकानुसार कामाचे नाव", key: "work_name" },
              { label: "लेखाशिर्ष", key: "account_head" },
              { label: "प्रशासकीय मान्यता क्रमांक, दिनांक व रक्कम", key: "admin_approval_number" },
              { label: "तांत्रिक मान्यता क्रमांक व दिनांक", key: "technical_approval_number" },
              { label: "रस्त्याची लांबी / इमारतीचे क्षेत्रफळ", key: "road_length_building_area" },
              { label: "कारनामा क्रमांक, रक्कम व टक्केवारी (कमी / अधिक)", key: "contract_number" },
              { label: "ठेकेदाराचे नाव", key: "contractor_name" },
              { label: "कार्यारंभ आदेश पत्र क्रमांक, दिनांक व कामाचा विहित कालावधी (पासून पर्यंत)", key: "work_start_order_number" },
              { label: "मुदतवाढी संबंधी सविस्तर तपशिल व कारणे", key: "extension_details" },
              { label: "तांत्रिक मान्यता प्राप्त अंदाजपत्रका नुसार कामांचा वाव", key: "work_scope" },
              { label: "कामाची सद्यस्थिती (मुख्य बाबी निहाय)", key: "current_status" },
              { label: "मोजमाप पुस्तक व पान क्रमांक", key: "measurement_book_details" },
              { label: "देयकाची सद्यस्थिती व आता पावेतो झालेला", key: "payment_status" }
            ].map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-2 py-1 text-center">
                  {index + 1}
                </td>
                <td className="border border-black px-2 py-1">{item.label}</td>
                <td className="border border-black px-2 py-1">
                  <textarea
                    value={bandhakamFormData[item.key as keyof BandhakamFormData]}
                    onChange={(e) => setBandhakamFormData(prev => ({
                      ...prev,
                      [item.key]: e.target.value
                    }))}
                    className="w-full px-2 py-1 border-none resize-none focus:outline-none"
                    rows={2}
                    disabled={isViewMode}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Inspector Information */}
        <div className="bg-gray-50 p-6 rounded-lg mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Inspector Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Name
              </label>
              <input
                type="text"
                value={bandhakamFormData.inspector_name}
                onChange={(e) => setBandhakamFormData(prev => ({
                  ...prev,
                  inspector_name: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter inspector name"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                value={bandhakamFormData.inspector_designation}
                onChange={(e) => setBandhakamFormData(prev => ({
                  ...prev,
                  inspector_designation: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter designation"
                disabled={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date
              </label>
              <input
                type="date"
                value={bandhakamFormData.visit_date_inspector}
                onChange={(e) => setBandhakamFormData(prev => ({
                  ...prev,
                  visit_date_inspector: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        <p className="italic mt-4 text-gray-500 text-sm">Scanned with CamScanner</p>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Information
        </h3>
      </div>
      
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.locationName')}
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({
              ...prev,
              location_name: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={t('fims.enterLocationName')}
            required
            disabled={isViewMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Date
            </label>
            <input
              type="date"
              value={inspectionData.planned_date}
              onChange={(e) => setInspectionData(prev => ({
                ...prev,
                planned_date: e.target.value
              }))}
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
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>{isLoading ? 'Getting Location...' : 'Get Current Location'}</span>
            </button>
          </div>
        </div>

        {inspectionData.latitude && inspectionData.longitude && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">Location Captured</p>
            <div className="text-xs text-green-600 space-y-1">
              <p>Latitude: {inspectionData.latitude.toFixed(6)}</p>
              <p>Longitude: {inspectionData.longitude.toFixed(6)}</p>
              <p>Accuracy: {inspectionData.location_accuracy ? Math.round(inspectionData.location_accuracy) + 'm' : 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location/Address (Auto Detected)
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({
              ...prev,
              address: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder={t('fims.enterFullAddress')}
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

      {!isViewMode && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Construction Photos</h4>
          <p className="text-gray-600 mb-4">Upload photos of the construction work for documentation</p>
          
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
          <p className="text-xs text-gray-500 mt-2">Maximum 5 photos allowed</p>
        </div>
      )}

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
                  alt={`Construction photo ${index + 1}`}
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
                <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
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
                  alt={photo.description || `Construction photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {photo.photo_name || `Photo ${index + 1}`}
                </p>
                {photo.description && (
                  <p className="text-xs text-gray-500 truncate">{photo.description}</p>
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
        return renderBandhakamForm();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bandhakamFormData.work_name && bandhakamFormData.contractor_name;
      case 2:
        return inspectionData.location_name;
      case 3:
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
            
            <div className="text-center">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                बांधकाम विभाग, पाहणी अहवाल
              </h1>
              <h2 className="text-md md:text-lg font-semibold text-gray-700">
                Construction Department Inspection Report
              </h2>
            </div>
            
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}
          
          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              Form Details
            </div>
            <div className={`${currentStep >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
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
            {currentStep === 3 && !isViewMode && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading || isUploading}
                className="px-3 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
              >
                <Save className="h-4 w-4" />
                <span>{t('fims.saveAsDraft')}</span>
              </button>
            )}

            {currentStep === 3 && !isViewMode && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading || isUploading}
                className="px-3 md:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
              >
                <Send className="h-4 w-4" />
                <span>{isEditMode ? t('fims.updateInspection') : t('fims.submitInspection')}</span>
              </button>
            )}

            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={!canProceedToNext() || isViewMode}
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

export default BandhakamVibhag1Form;
