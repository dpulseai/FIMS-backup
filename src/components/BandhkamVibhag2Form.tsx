import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Camera, Save, Send, Building, FileText, Calendar, User, Users, ClipboardCheck, Award, Clock } from 'lucide-react';
import supabase from '../lib/supabase';
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
  inspectiondate: string;
  // Present officers/staff (up to 4 entries)
  officer1name: string;
  officer1designation: string;
  officer2name: string;
  officer2designation: string;
  officer3name: string;
  officer3designation: string;
  officer4name: string;
  officer4designation: string;
  // Work details
  currentworkstatus: string;
  workquality: string;
  defectliabilityperiod: string;
  // Inspection report
  workname: string;
  inspectionreport: string;
  // Inspector information
  inspectorname: string;
  inspectordesignation: string;
}

export const BandhkamVibhag2Form: React.FC<BandhkamVibhag2FormProps> = ({ user, onBack, categories, onInspectionCreated, editingInspection }) => {
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
    categoryid: '',
    locationname: '',
    address: '',
    planneddate: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationaccuracy: null as number | null,
  });

  // Bandhkam Vibhag 2 form data
  const [bandhkamVibhag2FormData, setBandhkamVibhag2FormData] = useState<BandhkamVibhag2FormData>({
    inspectiondate: '',
    officer1name: '',
    officer1designation: '',
    officer2name: '',
    officer2designation: '',
    officer3name: '',
    officer3designation: '',
    officer4name: '',
    officer4designation: '',
    currentworkstatus: '',
    workquality: '',
    defectliabilityperiod: '',
    workname: '',
    inspectionreport: '',
    inspectorname: '',
    inspectordesignation: '',
  });

  // Get bandhkam vibhag 2 category
  const bandhkamVibhag2Category = categories.find(cat => cat.formtype === 'bandhkamvibhag2');

  useEffect(() => {
    if (bandhkamVibhag2Category) {
      setInspectionData(prev => ({ ...prev, categoryid: bandhkamVibhag2Category.id }), bandhkamVibhag2Category);
    }
  }, [bandhkamVibhag2Category]);

  // Load existing inspection data when editing
  useEffect(() => {
    if (editingInspection && editingInspection.id) {
      // Load basic inspection data
      setInspectionData({
        categoryid: editingInspection.categoryid,
        locationname: editingInspection.locationname,
        address: editingInspection.address,
        planneddate: editingInspection.planneddate ? editingInspection.planneddate.split('T')[0] : '',
        latitude: editingInspection.latitude,
        longitude: editingInspection.longitude,
        locationaccuracy: editingInspection.locationaccuracy,
      });

      // Load form data if it exists
      if (editingInspection.formdata) {
        setBandhkamVibhag2FormData({
          ...bandhkamVibhag2FormData,
          ...editingInspection.formdata,
          ...editingInspection,
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
          locationaccuracy: position.coords.accuracy,
        }));

        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const locationName = data.results[0].formatted_address;
            setInspectionData(prev => ({ ...prev, address: locationName }));
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
        const fileName = `bandhkamvibhag2-${inspectionId}-${Date.now()}-${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('field-visit-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('field-visit-images')
          .getPublicUrl(fileName);

        // Save photo record to database
        const { error: dbError } = await supabase
          .from('fimsinspectionphotos')
          .insert({
            inspectionid: inspectionId,
            photourl: publicUrl,
            photoname: file.name,
            description: `Bandhkam Vibhag 2 inspection photo ${i + 1}`,
            photoorder: i + 1,
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
        planneddate: inspectionData.planneddate || null,
      };

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Update existing inspection
        const { data: updateResult, error: updateError } = await supabase
          .from('fimsinspections')
          .update({
            locationname: sanitizedInspectionData.locationname,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            address: sanitizedInspectionData.address,
            planneddate: sanitizedInspectionData.planneddate,
            inspectiondate: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            formdata: bandhkamVibhag2FormData,
          })
          .eq('id', editingInspection.id)
          .select()
          .single();
        if (updateError) throw updateError;
        inspectionResult = updateResult;

        // Upsert bandhakamvibhag2 form record
        const officersArray = [
          bandhkamVibhag2FormData.officer1name && bandhkamVibhag2FormData.officer1designation
            ? { name: bandhkamVibhag2FormData.officer1name, designation: bandhkamVibhag2FormData.officer1designation }
            : null,
          bandhkamVibhag2FormData.officer2name && bandhkamVibhag2FormData.officer2designation
            ? { name: bandhkamVibhag2FormData.officer2name, designation: bandhkamVibhag2FormData.officer2designation }
            : null,
          bandhkamVibhag2FormData.officer3name && bandhkamVibhag2FormData.officer3designation
            ? { name: bandhkamVibhag2FormData.officer3name, designation: bandhkamVibhag2FormData.officer3designation }
            : null,
          bandhkamVibhag2FormData.officer4name && bandhkamVibhag2FormData.officer4designation
            ? { name: bandhkamVibhag2FormData.officer4name, designation: bandhkamVibhag2FormData.officer4designation }
            : null,
        ].filter(officer => officer !== null);

        const { error: formError } = await supabase
          .from('bandhakamvibhag2')
          .upsert({
            inspectionid: editingInspection.id,
            inspectiondate: bandhkamVibhag2FormData.inspectiondate,
            officers: officersArray,
            currentworkstatus: bandhkamVibhag2FormData.currentworkstatus,
            workquality: bandhkamVibhag2FormData.workquality,
            liabilityperiod: bandhkamVibhag2FormData.defectliabilityperiod,
            reportworkname: bandhkamVibhag2FormData.workname,
            detailedreport: bandhkamVibhag2FormData.inspectionreport,
          });
        if (formError) throw formError;
      } else {
        // Create new inspection
        const inspectionNumber = generateInspectionNumber();
        const { data: createResult, error: createError } = await supabase
          .from('fimsinspections')
          .insert({
            inspectionnumber: inspectionNumber,
            categoryid: sanitizedInspectionData.categoryid,
            inspectorid: user.id,
            locationname: sanitizedInspectionData.locationname,
            latitude: sanitizedInspectionData.latitude,
            longitude: sanitizedInspectionData.longitude,
            locationaccuracy: sanitizedInspectionData.locationaccuracy,
            address: sanitizedInspectionData.address,
            planneddate: sanitizedInspectionData.planneddate,
            inspectiondate: new Date().toISOString(),
            status: isDraft ? 'draft' : 'submitted',
            formdata: bandhkamVibhag2FormData,
          })
          .select()
          .single();
        if (createError) throw createError;
        inspectionResult = createResult;

        // Create bandhakamvibhag2 form record
        const officersArray = [
          bandhkamVibhag2FormData.officer1name && bandhkamVibhag2FormData.officer1designation
            ? { name: bandhkamVibhag2FormData.officer1name, designation: bandhkamVibhag2FormData.officer1designation }
            : null,
          bandhkamVibhag2FormData.officer2name && bandhkamVibhag2FormData.officer2designation
            ? { name: bandhkamVibhag2FormData.officer2name, designation: bandhkamVibhag2FormData.officer2designation }
            : null,
          bandhkamVibhag2FormData.officer3name && bandhkamVibhag2FormData.officer3designation
            ? { name: bandhkamVibhag2FormData.officer3name, designation: bandhkamVibhag2FormData.officer3designation }
            : null,
          bandhkamVibhag2FormData.officer4name && bandhkamVibhag2FormData.officer4designation
            ? { name: bandhkamVibhag2FormData.officer4name, designation: bandhkamVibhag2FormData.officer4designation }
            : null,
        ].filter(officer => officer !== null);

        const { error: formError } = await supabase
          .from('bandhakamvibhag2')
          .insert({
            inspectionid: inspectionResult.id,
            inspectiondate: bandhkamVibhag2FormData.inspectiondate,
            officers: officersArray,
            currentworkstatus: bandhkamVibhag2FormData.currentworkstatus,
            workquality: bandhkamVibhag2FormData.workquality,
            liabilityperiod: bandhkamVibhag2FormData.defectliabilityperiod,
            reportworkname: bandhkamVibhag2FormData.workname,
            detailedreport: bandhkamVibhag2FormData.inspectionreport,
          });
        if (formError) throw formError;
      }

      // Upload photos if any
      if (uploadedPhotos.length > 0) {
        await uploadPhotosToSupabase(inspectionResult.id);
      }

      const isUpdate = editingInspection && editingInspection.id;
      const message = isDraft
        ? isUpdate
          ? t('fims.inspectionUpdatedAsDraft')
          : t('fims.inspectionSavedAsDraft')
        : isUpdate
        ? t('fims.inspectionUpdatedSuccessfully')
        : t('fims.inspectionSubmittedSuccessfully');

      alert(message);
      onInspectionCreated();
      onBack();
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`Error saving inspection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map(step => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.inspectiondate')}
          </label>
          <input
            type="date"
            value={bandhkamVibhag2FormData.inspectiondate}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, inspectiondate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.workname')}
          </label>
          <input
            type="text"
            value={bandhkamVibhag2FormData.workname}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, workname: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('placeholder.workname')}
            required
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Present Officers/Staff Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-teal-600" />
          Present Officers/Staff
        </h4>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {`${num}- ${t('label.officername')}`}
                </label>
                <input
                  type="text"
                  value={bandhkamVibhag2FormData[`officer${num}name`] as keyof BandhkamVibhag2FormData as string}
                  onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, [`officer${num}name`]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={t('placeholder.officername')}
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('label.officerdesignation')}
                </label>
                <input
                  type="text"
                  value={bandhkamVibhag2FormData[`officer${num}designation`] as keyof BandhkamVibhag2FormData as string}
                  onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, [`officer${num}designation`]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={t('placeholder.officerdesignation')}
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
          Location Information
        </h3>
      </div>
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.locationname')}
          </label>
          <input
            type="text"
            value={inspectionData.locationname}
            onChange={(e) => setInspectionData(prev => ({ ...prev, locationname: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('placeholder.locationname')}
            required
            disabled={isViewMode}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.planneddate')}
            </label>
            <input
              type="date"
              value={inspectionData.planneddate}
              onChange={(e) => setInspectionData(prev => ({ ...prev, planneddate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isViewMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GPS Location</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading || isViewMode}
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              <span>{isLoading ? t('common.gettinglocation') : t('button.getcurrentlocation')}</span>
            </button>
          </div>
        </div>
        {inspectionData.latitude && inspectionData.longitude && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-2">{t('common.locationcaptured')}</p>
            <div className="text-xs text-green-600 space-y-1">
              <p>{inspectionData.latitude.toFixed(6)}</p>
              <p>{inspectionData.longitude.toFixed(6)}</p>
              <p>{inspectionData.locationaccuracy ? `${Math.round(inspectionData.locationaccuracy)}m` : 'NA'}</p>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.address')}
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            placeholder={t('placeholder.address')}
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderBandhkamVibhag2Form = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        - Construction Department Inspection Form-2 -
      </h3>

      {/* Work Status and Quality */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2 text-teal-600" />
          Work Status and Quality
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.currentworkstatus')}
            </label>
            <textarea
              value={bandhkamVibhag2FormData.currentworkstatus}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, currentworkstatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={4}
              placeholder={t('placeholder.currentworkstatus')}
              disabled={isViewMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.workquality')}
            </label>
            <select
              value={bandhkamVibhag2FormData.workquality}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, workquality: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">{t('placeholder.selectquality')}</option>
              <option value="option1">{t('option.excellent')}</option>
              <option value="option2">{t('option.good')}</option>
              <option value="option3">{t('option.average')}</option>
              <option value="option4">{t('option.poor')}</option>
              <option value="option5">{t('option.unsatisfactory')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.defectliabilityperiod')}
            </label>
            <input
              type="text"
              value={bandhkamVibhag2FormData.defectliabilityperiod}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, defectliabilityperiod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('placeholder.defectliabilityperiod')}
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Inspection Report */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-teal-600" />
          Inspection Report
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.inspectionreport')}
          </label>
          <textarea
            value={bandhkamVibhag2FormData.inspectionreport}
            onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, inspectionreport: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={6}
            placeholder={t('placeholder.inspectionreport')}
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Inspector Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-teal-600" />
          Inspector Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.inspectorname')}
            </label>
            <input
              type="text"
              value={bandhkamVibhag2FormData.inspectorname}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, inspectorname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('placeholder.inspectorname')}
              disabled={isViewMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.inspectordesignation')}
            </label>
            <input
              type="text"
              value={bandhkamVibhag2FormData.inspectordesignation}
              onChange={(e) => setBandhkamVibhag2FormData(prev => ({ ...prev, inspectordesignation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('placeholder.inspectordesignation')}
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
        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Construction Work Photos</h4>
        <p className="text-gray-600 mb-4">
          {t('fims.uploadphotosconstruction')}
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
            <label htmlFor="photo-upload" className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors duration-200">
              <Camera className="h-4 w-4 mr-2" />
              {t('fims.choosefiles')}
            </label>
            <p className="text-xs text-gray-500 mt-2">{t('fims.maxphotosallowed')}</p>
          </>
        )}
      </div>

      {uploadedPhotos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {t('fims.uploadedphotos')} ({uploadedPhotos.length}/5)
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
      {isViewMode && editingInspection?.fimsinspectionphotos && editingInspection.fimsinspectionphotos.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Inspection Photos ({editingInspection.fimsinspectionphotos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {editingInspection.fimsinspectionphotos.map((photo: any, index: number) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photourl}
                  alt={`${photo.description} Construction photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1 truncate">{photo.photoname} Photo {index + 1}</p>
                {photo.description && (
                  <p className="text-xs text-gray-500 truncate">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message when no photos in view mode */}
      {isViewMode && (!editingInspection?.fimsinspectionphotos || editingInspection.fimsinspectionphotos.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p>{t('fims.nophotosfound')}</p>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('fims.uploadingphotos')}</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderLocationDetails();
      case 3: return renderBandhkamVibhag2Form();
      case 4: return renderPhotoUpload();
      default: return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bandhkamVibhag2FormData.inspectiondate && bandhkamVibhag2FormData.workname;
      case 2:
        return inspectionData.locationname;
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
                {t('fims.viewmode')} - {t('fims.formreadonly')}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.back')}</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
              {editingInspection?.mode === 'view'
                ? `${t('fims.viewinspection')} - ${editingInspection?.inspectionnumber}`
                : editingInspection?.mode === 'edit'
                ? `${t('fims.editinspection')} - ${editingInspection?.inspectionnumber}`
                : `${t('fims.newinspection')} - Bandhkam Vibhag 2`}
            </h1>
            <div className="w-20"></div>
          </div>
        </div>

        {renderStepIndicator()}

        <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
          <div className={currentStep === 1 ? 'text-teal-600 font-medium' : 'text-gray-500'}>
            1
          </div>
          <div className={currentStep === 2 ? 'text-teal-600 font-medium' : 'text-gray-500'}>
            {t('fims.locationdetails')}
          </div>
          <div className={currentStep === 3 ? 'text-teal-600 font-medium' : 'text-gray-500'}>
            3
          </div>
          <div className={currentStep === 4 ? 'text-teal-600 font-medium' : 'text-gray-500'}>
            {t('fims.photossubmit')}
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
                    <span>{t('fims.saveasdraft')}</span>
                  </button>
                )}
                {!isViewMode && (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading || isUploading}
                    className="px-3 md:px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-sm md:text-base"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isEditMode ? t('fims.updateinspection') : t('fims.submitinspection')}</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={(!canProceedToNext() && !isViewMode) || (isViewMode && currentStep === 4)}
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
