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
  Heart,
  Stethoscope
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PahuvaidhakiyaTapasaniFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface PahuvaidhakiyaFormData {
  // Basic information
  institution_name: string;
  institution_address: string;
  institution_category: string; // श्रेणी-1 / श्रेणी-2 / फिरते पवैद्य
  head_name: string;
  head_contact: string;
  inspector_name: string;
  inspector_designation: string;
  visit_date: string;
  visit_time: string;
  inspection_purpose: string;
  
  // Technical work overview data (JSON to store table data)
  technical_work_data: any[];
  
  // Disease information
  village_name: string;
  disease_name: string;
  outbreak_period: string;
  livestock_count: string;
  infection_count: string;
  death_count: string;
  vaccination_done: string;
  action_taken: string;
  villages_10km_count: string;
  livestock_10km_area: string;
  previous_outbreak_info: string;
  edr_submission_date: string;
  team_visit_dates: string;
  
  // Vaccination program data (JSON to store table data)
  vaccination_program_data: any[];
  
  // Scheme progress data (updated to match table)
  scheme_progress_data: any[];
  
  // General technical evaluation
  general_evaluation: string;
  
  // Instructions given
  instructions_given: string;
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

  // Pahuvaidhakiya form data
  const [pahuvaidhakiyaFormData, setPahuvaidhakiyaFormData] = useState<PahuvaidhakiyaFormData>({
    institution_name: '',
    institution_address: '',
    institution_category: '',
    head_name: '',
    head_contact: '',
    inspector_name: '',
    inspector_designation: '',
    visit_date: '',
    visit_time: '',
    inspection_purpose: '',
    technical_work_data: [],
    village_name: '',
    disease_name: '',
    outbreak_period: '',
    livestock_count: '',
    infection_count: '',
    death_count: '',
    vaccination_done: '',
    action_taken: '',
    villages_10km_count: '',
    livestock_10km_area: '',
    previous_outbreak_info: '',
    edr_submission_date: '',
    team_visit_dates: '',
    vaccination_program_data: [],
    scheme_progress_data: [],
    general_evaluation: '',
    instructions_given: ''
  });

  // Get pahuvaidhakiya category
  const pahuvaidhakiyaCategory = categories.find(cat => cat.form_type === 'pashutapasani');

  useEffect(() => {
    if (pahuvaidhakiyaCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: pahuvaidhakiyaCategory.id
      }));
    }
  }, [pahuvaidhakiyaCategory]);

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
        setPahuvaidhakiyaFormData({
          ...pahuvaidhakiyaFormData,
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

    // Clear any cached location data by requesting fresh location
    // This forces the browser to get a new GPS fix instead of using cached data
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        // Get location name using Google Maps Geocoding API
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDzOjsiqs6rRjSJWVdXfUBl4ckXayL8AbE'}&language=mr`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            
            // Update all location data in a single state call
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location_accuracy: accuracy,
              address: address,
              location_name: prev.location_name || address // Auto-fill if empty
            }));
          } else {
            // No geocoding results, just update coordinates
            setInspectionData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              location_accuracy: accuracy,
              address: 'Location detected but address not found'
            }));
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          // Fallback: just update coordinates without address
          setInspectionData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location_accuracy: accuracy,
            address: 'Unable to get address'
          }));
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('fims.unableToGetLocation'));
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, // Increased timeout for better GPS fix
        maximumAge: 0 // Force fresh location, don't use cached data
      }
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
        const fileName = `pahuvaidhakiya_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
    return `PVT-${year}${month}${day}-${time}`;
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
            form_data: pahuvaidhakiyaFormData
          })
          .eq('id', editingInspection.id)
          .select()
          .single();

        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert pahuvaidhakiya form record
        const { error: formError } = await supabase
          .from('pahuvaidhakiya_tapasani')
          .upsert({
            inspection_id: editingInspection.id,
            ...pahuvaidhakiyaFormData
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
            form_data: pahuvaidhakiyaFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create pahuvaidhakiya form record
        const { error: formError } = await supabase
          .from('pahuvaidhakiya_tapasani')
          .insert({
            inspection_id: inspectionResult.id,
            ...pahuvaidhakiyaFormData
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
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-cyan-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Stethoscope className="h-5 w-5 mr-2 text-cyan-600" />
        मूलभूत माहिती (Basic Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संस्थेचे नांव *
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.institution_name}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, institution_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="संस्थेचे नांव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संस्थेचा पत्ता
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.institution_address}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, institution_address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="संस्थेचा पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            श्रेणी *
          </label>
          <select
            value={pahuvaidhakiyaFormData.institution_category}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, institution_category: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={isViewMode}
          >
            <option value="">श्रेणी निवडा</option>
            <option value="श्रेणी-1">श्रेणी-1</option>
            <option value="श्रेणी-2">श्रेणी-2</option>
            <option value="फिरते पवैद्य">फिरते पवैद्य</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संस्था प्रमुखांचे नाव
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.head_name}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, head_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="संस्था प्रमुखांचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संपर्क क्रमांक
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.head_contact}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, head_contact: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="संपर्क क्रमांक प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणी करणाऱ्या अधिकाऱ्याचे नाव
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.inspector_name}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, inspector_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="अधिकाऱ्याचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            हुद्दा
          </label>
          <input
            type="text"
            value={pahuvaidhakiyaFormData.inspector_designation}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, inspector_designation: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="हुद्दा प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेटीचा दिनांक *
          </label>
          <input
            type="date"
            value={pahuvaidhakiyaFormData.visit_date}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, visit_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेटीचा वेळ
          </label>
          <input
            type="time"
            value={pahuvaidhakiyaFormData.visit_time}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, visit_time: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            disabled={isViewMode}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तपासणीचा उद्देश
          </label>
          <div className="space-y-2">
            {['नियमित', 'विशिष्ठ कारणासाठी', 'आकस्मिक', 'तक्रार कारण नमूद करावे'].map((purpose) => (
              <label key={purpose} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="inspection_purpose"
                  value={purpose}
                  checked={pahuvaidhakiyaFormData.inspection_purpose === purpose}
                  onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, inspection_purpose: e.target.value}))}
                  className="text-cyan-600 focus:ring-cyan-500"
                  disabled={isViewMode}
                />
                <span className="text-sm text-gray-700">{purpose}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-4 rounded-t-lg">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={3}
            placeholder="संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderTechnicalInspection = () => {
    const technicalWorkItems = [
      '1) बाह्यरुग्ण',
      '2) अंतर्गत रुग्ण',
      '3) फिरते रुग्ण',
      '4) खर्चीकरण (मुख्यालय)',
      '5) खर्चीकरण (फिरतीवर)',
      '6) मोठ्या शस्त्रक्रिया - मुख्यालय',
      'मोठ्या शस्त्रक्रिया - फिरती',
      'मोठ्या शस्त्रक्रिया - एकूण',
      '7) छोट्या शस्त्रक्रिया - मुख्यालय',
      'छोट्या शस्त्रक्रिया -फिरती',
      'छोट्या शस्त्रक्रिया -एकूण',
      '8) कृत्रिम रेतन (प्रथम) -विदेशी',
      'कृत्रिम रेतन (प्रथम) -संकरीत',
      'कृत्रिम रेतन (प्रथम) -देशी',
      'कृत्रिम रेतन (प्रथम) -म्हैस',
      'कृत्रिम रेतन (प्रथम) -एकूण',
      '9) जन्मलेली वासरे - गाय (संकरीत)',
      'जन्मलेली वासरे - गाय (देशी)',
      'जन्मलेली वासरे -म्हैस ',
      'जन्मलेली वासरे - एकूण',
      '10) प्रति वासरू लागलेले गाय (संकरीत)',
      'कृत्रिम रेतन प्रमाण गाय (देशी)',
      'म्हैस',
      '11) गर्भ तपासणी - गाय',
      'गर्भ तपासणी - म्हैस',
      'गर्भ तपासणी - एकूण',
      '12) वांझ जनावरे तपासणी -गाय ',
      'वांझ जनावरे तपासणी -म्हैस',
      'वांझ जनावरे तपासणी - एकूण',
      '13) ऋणांची रोजची सरासरी हजेरी',
      '14) जमा सेवाशुल्क'
    ];

    const vaccineItems = [
      'HS', 'HS+BQ', 'BQ', 'FMD', 'PPR', 'ETV', 'Fowl Pox', 'RD', 'LSD', 'Goat Pox', 'CSF', 'Theileria', 'Other'
    ];

    const schemeItems = [
      'दुधाळ जनावरांचे गट वाटप',
      'शेळी/मेंढी गट वाटप',
      'कुक्कुट शेड बांधकाम',
      'तलंगा गट वाटप',
      'एक दिवसीय पिलांचे वाटप',
      'उबवणीची अंडी वाटप'
    ];

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-cyan-600" />
          A. तांत्रिक माहिती (Technical Information)
        </h3>

        {/* Technical Work Overview */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">6. तांत्रिक कामाचा आढावा :-</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">कामाचे स्वरूप</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">लक्ष्य (चालू वर्षी)</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">साध्य (महिना अखेर)</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">साध्य (मागील वर्ष) त्याच महिनाचा अखेर</th>
                </tr>
              </thead>
              <tbody>
                {technicalWorkItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{item}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.technical_work_data[index]?.target || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.technical_work_data];
                          newData[index] = { ...newData[index], target: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, technical_work_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="0"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.technical_work_data[index]?.achieved_current || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.technical_work_data];
                          newData[index] = { ...newData[index], achieved_current: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, technical_work_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="0"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.technical_work_data[index]?.achieved_last || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.technical_work_data];
                          newData[index] = { ...newData[index], achieved_last: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, technical_work_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="0"
                        disabled={isViewMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disease Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">7. रोग प्रादुर्भाव माहिती :-</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                गावाचे नाव
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.village_name}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, village_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="गावाचे नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                रोगाचे नाव
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.disease_name}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, disease_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="रोगाचे नाव प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रादुर्भावाचा कालावधी
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.outbreak_period}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, outbreak_period: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="प्रादुर्भावाचा कालावधी प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पशुधन संख्या
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.livestock_count}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, livestock_count: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="पशुधन संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                लागण
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.infection_count}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, infection_count: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="लागण संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                मृत्यू
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.death_count}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, death_count: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="मृत्यू संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                लसीकरण
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.vaccination_done}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_done: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="लसीकरण माहिती प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                केलेली कार्यवाही
              </label>
              <textarea
                value={pahuvaidhakiyaFormData.action_taken}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, action_taken: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows={3}
                placeholder="केलेली कार्यवाही प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                10 किमी परिघातील गावांची संख्या:
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.villages_10km_count}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, villages_10km_count: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                10 किमी परिसरातील पशुधन संख्या (गाय/म्हैस वर्गीय, शेळी/मेंढी/इतर)-
              </label>
              <input
                type="text"
                value={pahuvaidhakiyaFormData.livestock_10km_area}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, livestock_10km_area: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="१० किमी परिसरातील पशुधन संख्या प्रविष्ट करा"
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                या पूर्वी झालेला रोग प्रादुर्भाव माहिती
              </label>
              <textarea
                value={pahuvaidhakiyaFormData.previous_outbreak_info}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, previous_outbreak_info: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows={3}
                disabled={isViewMode}
              />
            </div>
           
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EDR (Endemic disease report) सादर दिनांक, DVP/TMVP/RDIL/DIS team visit date :
              </label>
              <input
                type="date"
                value={pahuvaidhakiyaFormData.edr_submission_date}
                onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, edr_submission_date: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Vaccination Program */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">8. लसीकरण कार्यक्रम :-</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2">लसीचे नाव</th>
                  <th className="border border-gray-300 px-2 py-2">कार्यक्षेत्रातील पात्र पशुधनाची संख्या</th>
                  <th className="border border-gray-300 px-2 py-2">लसमागणी / लस प्राप्त झाल्याचा दिनांक</th>
                  <th className="border border-gray-300 px-2 py-2">प्राप्त लसमात्रा</th>
                  <th className="border border-gray-300 px-2 py-2">मागील शिल्लक लसमात्रा</th>
                  <th className="border border-gray-300 px-2 py-2">एकूण लसमात्रा</th>
                  <th className="border border-gray-300 px-2 py-2">लसीकरणाचा दिनांक</th>
                  <th className="border border-gray-300 px-2 py-2">1 एप्रिल पासून झालेली लसीकरण</th>
                  <th className="border border-gray-300 px-2 py-2">लसीकरण वेळेत झाले नसल्यास त्याची कारणे</th>
                </tr>
              </thead>
              <tbody>
                {vaccineItems.map((vaccine, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-2 font-medium">{vaccine}</td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.eligible_livestock || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], eligible_livestock: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.demand_date || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], demand_date: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.received_doses || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], received_doses: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.previous_balance || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], previous_balance: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.total_doses || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], total_doses: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.vaccination_date || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], vaccination_date: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.vaccinations_since_april || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], vaccinations_since_april: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.vaccination_program_data[index]?.reason_if_delayed || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.vaccination_program_data];
                          newData[index] = { ...newData[index], reason_if_delayed: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, vaccination_program_data: newData}));
                        }}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheme Progress */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">9. योजना प्रगती :-</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">स्वरूप</th>
                  <th className="border border-gray-300 px-3 py-2">लक्ष्य (चालू वर्षी)</th>
                  <th className="border border-gray-300 px-3 py-2">साध्य (चालू वर्षी)</th>
                  <th className="border border-gray-300 px-3 py-2">साध्य (मागील वर्षी)</th>
                  <th className="border border-gray-300 px-3 py-2">अभिप्राय</th>
                </tr>
              </thead>
              <tbody>
                {schemeItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{item}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.scheme_progress_data[index]?.target || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.scheme_progress_data];
                          newData[index] = { ...newData[index], target: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, scheme_progress_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.scheme_progress_data[index]?.achieved_current || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.scheme_progress_data];
                          newData[index] = { ...newData[index], achieved_current: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, scheme_progress_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.scheme_progress_data[index]?.achieved_last || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.scheme_progress_data];
                          newData[index] = { ...newData[index], achieved_last: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, scheme_progress_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={pahuvaidhakiyaFormData.scheme_progress_data[index]?.feedback || ''}
                        onChange={(e) => {
                          const newData = [...pahuvaidhakiyaFormData.scheme_progress_data];
                          newData[index] = { ...newData[index], feedback: e.target.value };
                          setPahuvaidhakiyaFormData(prev => ({...prev, scheme_progress_data: newData}));
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500"
                        placeholder="-"
                        disabled={isViewMode}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
        {/* General Evaluation */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">10. सर्वसाधारण तांत्रिक मुल्यमापन :</h4>
          <textarea
            value={pahuvaidhakiyaFormData.general_evaluation}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, general_evaluation: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            rows={4}
            placeholder="सर्वसाधारण तांत्रिक मुल्यमापन प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        {/* Instructions Given */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">11. दिलेल्या सूचना :</h4>
          <textarea
            value={pahuvaidhakiyaFormData.instructions_given}
            onChange={(e) => setPahuvaidhakiyaFormData(prev => ({...prev, instructions_given: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            rows={4}
            placeholder="दिलेल्या सूचना प्रविष्ट करा"
            disabled={isViewMode}
          />
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
          Upload Veterinary Inspection Photos
        </h4>
        <p className="text-gray-600 mb-4">
          पशुवैद्यकीय संस्था तपासणीसाठी फोटो अपलोड करा
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
              className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
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
        return renderTechnicalInspection();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return pahuvaidhakiyaFormData.institution_name && pahuvaidhakiyaFormData.institution_category && pahuvaidhakiyaFormData.visit_date;
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
               t('fims.newInspection')} - पशुवैद्यकीय तपासणी प्रपत्र
            </h1>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              मूलभूत माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              पशुवैद्यकीय तपासणी
            </div>
            <div className={`${currentStep === 4 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.photosSubmit')}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 rounded-xl shadow-lg border-2 border-cyan-200 p-4 md:p-6 mb-4 md:mb-6">
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
                    className="px-3 md:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
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
                className="px-4 md:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base"
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
