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
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface BandhkamVibhag2FormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface BandhkamVibhag2FormData {
  // Basic inspection information
  inspection_date: string;
  
  // Present officers/staff (up to 4 entries)
  officer_1_name: string;
  officer_1_designation: string;
  officer_2_name: string;
  officer_2_designation: string;
  officer_3_name: string;
  officer_3_designation: string;
  officer_4_name: string;
  officer_4_designation: string;
  
  // Work details
  current_work_status: string;
  work_quality: string;
  defect_liability_period: string;
  
  // Inspection report
  work_name: string;
  inspection_report: string;
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
}

export const BandhkamVibhag2Form: React.FC<BandhkamVibhag2FormProps> = ({
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

  // Bandhkam Vibhag 2 form data
  const [bandhkamVibhag2FormData, setBandhkamVibhag2FormData] = useState<BandhkamVibhag2FormData>({
    inspection_date: '',
    officer_1_name: '',
    officer_1_designation: '',
    officer_2_name: '',
    officer_2_designation: '',
    officer_3_name: '',
    officer_3_designation: '',
    officer_4_name: '',
    officer_4_designation: '',
    current_work_status: '',
    work_quality: '',
    defect_liability_period: '',
    work_name: '',
    inspection_report: '',
    inspector_name: '',
    inspector_designation: ''
  });

  // Get bandhkam vibhag 2 category
  const bandhkamVibhag2Category = categories.find(cat => cat.form_type === 'bandhkam_vibhag2');

  useEffect(() => {
    if (bandhkamVibhag2Category) {
      setInspectionData(prev => ({
        ...prev,
        category_id: bandhkamVibhag2Category.id
      }));
    }
  }, [bandhkamVibhag2Category]);

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
        setBandhkamVibhag2FormData({
          ...bandhkamVibhag2FormData,
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
        const fileName = `bandhkam_vibhag2_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `Bandhkam Vibhag 2 inspection photo ${i + 1}`,
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
    return `BDK2-${year}${month}${day}-${time}`;
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
            form_data: bandhkamVibhag2FormData
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
            form_data: bandhkamVibhag2FormData
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
              ? 'bg-teal-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-teal-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
        मूलभूत माहिती (Basic Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणी दिनांक *
          </label>
          <input
            type="date"
            value={bandhkamVibhag2FormData.inspection_date}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, inspection_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            कामाचे नाव *
          </label>
          <input
            type="text"
            value={bandhkamVibhag2FormData.work_name}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, work_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="कामाचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Present Officers/Staff Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-teal-600" />
          उपस्थित अधिकारी / कर्मचारी (Present Officers/Staff)
        </h4>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  अधिकारी/कर्मचारी {num} - नाव
                </label>
                <input
                  type="text"
                  value={bandhkamVibhag2FormData[`officer_${num}_name` as keyof BandhkamVibhag2FormData] as string}
                  onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, [`officer_${num}_name`]: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="नाव प्रविष्ट करा"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  पदनाम
                </label>
                <input
                  type="text"
                  value={bandhkamVibhag2FormData[`officer_${num}_designation` as keyof BandhkamVibhag2FormData] as string}
                  onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, [`officer_${num}_designation`]: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="पदनाम प्रविष्ट करा"
                  disabled={isViewMode}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-t-lg">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            placeholder="संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderBandhkamVibhag2Form = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        बांधकाम विभाग तपासणी प्रपत्र-२ (Construction Department Inspection Form-2)
      </h3>

      {/* Work Status and Quality */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2 text-teal-600" />
          कामाची स्थिती आणि दर्जा (Work Status and Quality)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कामाची सद्यस्थिती
            </label>
            <textarea
              value={bandhkamVibhag2FormData.current_work_status}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, current_work_status: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={4}
              placeholder="कामाची सद्यस्थिती वर्णन करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कामाचा दर्जा
            </label>
            <select
              value={bandhkamVibhag2FormData.work_quality}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, work_quality: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">दर्जा निवडा</option>
              <option value="उत्कृष्ट">उत्कृष्ट</option>
              <option value="उत्तम">उत्तम</option>
              <option value="चांगला">चांगला</option>
              <option value="साधारण">साधारण</option>
              <option value="वाईट">वाईट</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              दोषदायित्व कालावधी
            </label>
            <input
              type="text"
              value={bandhkamVibhag2FormData.defect_liability_period}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, defect_liability_period: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="दोषदायित्व कालावधी प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Inspection Report */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-teal-600" />
          तपासणी अहवाल (Inspection Report)
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणी अहवाल
          </label>
          <textarea
            value={bandhkamVibhag2FormData.inspection_report}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, inspection_report: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={6}
            placeholder="तपासणी अहवाल तपशीलवार लिहा"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Inspector Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-teal-600" />
          निरीक्षकाची माहिती (Inspector Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              निरीक्षकाचे नाव
            </label>
            <input
              type="text"
              value={bandhkamVibhag2FormData.inspector_name}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, inspector_name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              value={bandhkamVibhag2FormData.inspector_designation}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({...prev, inspector_designation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="पदनाम प्रविष्ट करा"
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
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Upload Construction Work Photos
        </h4>
        <p className="text-gray-600 mb-4">
          Upload photos of the construction work for documentation and record keeping
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
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
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
                  alt={photo.description || `Construction photo ${index + 1}`}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
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
        return renderBandhkamVibhag2Form();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bandhkamVibhag2FormData.inspection_date && bandhkamVibhag2FormData.work_name;
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
               t('fims.newInspection')} - बांधकाम विभाग प्रपत्र-२
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
              बांधकाम तपासणी
            </div>
            <div className={`${currentStep === 4 ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-lg border-2 border-teal-200 p-4 md:p-6 mb-4 md:mb-6">
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
                  className="px-3 md:px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
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
                className="px-4 md:px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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