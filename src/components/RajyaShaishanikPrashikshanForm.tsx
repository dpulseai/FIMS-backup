import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  School,
  MapPin,
  Camera,
  Save,
  Send,
  Calendar,
  Users,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createAdarshShalaForm, updateAdarshShalaForm } from '../services/fimsService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface RajyaShaishanikPrashikshanFormProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

interface SchoolFormData {
  // Basic school information
  visit_date: string;
  school_name: string;
  school_address: string;
  principal_name: string;
  principal_mobile: string;
  udise_number: string;
  center: string;
  taluka: string;
  district: string;
  management_type: string;
  school_achievement_self: string;
  school_achievement_external: string;
  
  // Teacher information
  sanctioned_posts: number;
  working_posts: number;
  present_teachers: number;
  
  // Student enrollment and attendance
  class_enrollment: { [key: string]: { enrollment: number; attendance: number } };
  
  // Khan Academy information
  math_teachers_count: number;
  khan_registered_teachers: number;
  khan_registered_students: number;
  khan_active_students: number;
  
  // Text responses
  khan_usage_method: string;
  sqdp_prepared: string;
  sqdp_objectives_achieved: string;
  nipun_bharat_verification: string;
  learning_outcomes_assessment: string;
  
  // Subject-wise learning outcomes
  subject_learning_outcomes: { [key: string]: { [subject: string]: number } };
  
  // Officer feedback
  officer_feedback: string;
  innovative_initiatives: string;
  suggested_changes: string;
  srujanrang_articles: string;
  future_articles: string;
  ngo_involvement: string;
  
  // Materials and technology usage
  materials_usage: { [key: string]: { available: boolean; usage_status: string; suggestions: string } };
  
  // Inspector information
  inspector_name: string;
  inspector_designation: string;
  visit_date_inspector: string;
}

export const RajyaShaishanikPrashikshanForm: React.FC<RajyaShaishanikPrashikshanFormProps> = ({
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

  // Initialize class enrollment data
  const initializeClassData = () => {
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const classData: { [key: string]: { enrollment: number; attendance: number } } = {};
    classes.forEach(cls => {
      classData[cls] = { enrollment: 0, attendance: 0 };
    });
    return classData;
  };

  // Initialize subject learning outcomes
  const initializeSubjectData = () => {
    const classes = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const subjects = ['मराठी', 'गणित', 'इंग्रजी', 'प.अ./विज्ञान', 'इतिहास', 'भूगोल', 'हिंदी', 'शा.शि.', 'कार्यनुभव'];
    const subjectData: { [key: string]: { [subject: string]: number } } = {};
    classes.forEach(cls => {
      subjectData[cls] = {};
      subjects.forEach(subject => {
        subjectData[cls][subject] = 0;
      });
    });
    return subjectData;
  };

  // Initialize materials usage data
  const initializeMaterialsData = () => {
    const materials = [
      'मराठी/उर्दू विषय साहित्य पेटी',
      'गणित विषय साहित्य पेटी',
      'इंग्रजी विषय साहित्य पेटी',
      'DIKSHA APP',
      'तंत्रज्ञान / ई-साधने',
      'स्वनिर्मित ई-साधने',
      'विज्ञानविषयक साहित्य',
      'क्रीडा साहित्य',
      'रोबोटिक्स लॅब',
      'डिजिटल वर्गखोली',
      'व्हर्चुअल क्लासरूम',
      'इतर अध्ययन-अध्यापन साहित्य',
      'NGO कडून प्राप्त साहित्य'
    ];
    const materialsData: { [key: string]: { available: boolean; usage_status: string; suggestions: string } } = {};
    materials.forEach(material => {
      materialsData[material] = { available: false, usage_status: '', suggestions: '' };
    });
    return materialsData;
  };

  // School form data
  const [schoolFormData, setSchoolFormData] = useState<SchoolFormData>({
    visit_date: '',
    school_name: '',
    school_address: '',
    principal_name: '',
    principal_mobile: '',
    udise_number: '',
    center: '',
    taluka: '',
    district: '',
    management_type: '',
    school_achievement_self: '',
    school_achievement_external: '',
    sanctioned_posts: 0,
    working_posts: 0,
    present_teachers: 0,
    class_enrollment: initializeClassData(),
    math_teachers_count: 0,
    khan_registered_teachers: 0,
    khan_registered_students: 0,
    khan_active_students: 0,
    khan_usage_method: '',
    sqdp_prepared: '',
    sqdp_objectives_achieved: '',
    nipun_bharat_verification: '',
    learning_outcomes_assessment: '',
    subject_learning_outcomes: initializeSubjectData(),
    officer_feedback: '',
    innovative_initiatives: '',
    suggested_changes: '',
    srujanrang_articles: '',
    future_articles: '',
    ngo_involvement: '',
    materials_usage: initializeMaterialsData(),
    inspector_name: '',
    inspector_designation: '',
    visit_date_inspector: ''
  });

  // Get school inspection category
  const schoolCategory = categories.find(cat => cat.form_type === 'rajya_shaishanik');

  useEffect(() => {
    if (schoolCategory) {
      setInspectionData(prev => ({
        ...prev,
        category_id: schoolCategory.id
      }));
    }
  }, [schoolCategory, categories]);

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

      // Load adarsh shala form data
      const loadAdarshShalaData = async () => {
        try {
          const { getAdarshShalaForm } = await import('../services/fimsService');
          const formData = await getAdarshShalaForm(editingInspection.id);
          
          if (formData) {
            setSchoolFormData({
              visit_date: formData.visit_date || '',
              school_name: formData.school_name || '',
              school_address: formData.school_address || '',
              principal_name: formData.principal_name || '',
              principal_mobile: formData.principal_mobile || '',
              udise_number: formData.udise_number || '',
              center: formData.center_name || '',
              taluka: formData.taluka_name || '',
              district: formData.district_name || '',
              management_type: formData.management_type || '',
              school_achievement_self: formData.school_achievement_self || '',
              school_achievement_external: formData.school_achievement_external || '',
              sanctioned_posts: formData.sanctioned_posts || 0,
              working_posts: formData.working_posts || 0,
              present_teachers: formData.present_teachers || 0,
              class_enrollment: initializeClassData(),
              math_teachers_count: formData.math_teachers_count || 0,
              khan_registered_teachers: formData.khan_registered_teachers || 0,
              khan_registered_students: formData.khan_registered_students || 0,
              khan_active_students: formData.khan_active_students || 0,
              khan_usage_method: formData.khan_usage_method || '',
              sqdp_prepared: formData.sqdp_prepared || '',
              sqdp_objectives_achieved: formData.sqdp_objectives_achieved || '',
              nipun_bharat_verification: formData.nipun_bharat_verification || '',
              learning_outcomes_assessment: formData.learning_outcomes_assessment || '',
              subject_learning_outcomes: initializeSubjectData(),
              officer_feedback: formData.officer_feedback || '',
              innovative_initiatives: formData.innovative_initiatives || '',
              suggested_changes: formData.suggested_changes || '',
              srujanrang_articles: formData.srujanrang_articles || '',
              future_articles: formData.future_articles || '',
              ngo_involvement: formData.ngo_involvement || '',
              materials_usage: initializeMaterialsData(),
              inspector_name: formData.inspector_name || '',
              inspector_designation: formData.inspector_designation || '',
              visit_date_inspector: formData.visit_date_inspector || ''
            });
          }
        } catch (error) {
          console.error('Error loading adarsh shala form data:', error);
        }
      };
      
      loadAdarshShalaData();
    }
  }, [editingInspection]);

  // Load existing inspection data when editing (old method for backward compatibility)
  useEffect(() => {
    if (editingInspection && editingInspection.fims_school_inspection_forms && editingInspection.fims_school_inspection_forms.length > 0) {
      const formData = editingInspection.fims_school_inspection_forms[0];
      if (formData) {
        setSchoolFormData(prev => ({
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

  const generateInspectionNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `SCH-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsLoading(true);

      let inspectionResult;

      if (editingInspection && editingInspection.id) {
        // Convert empty strings to null for database compatibility
        const updateInspectionData = {
          ...inspectionData,
          planned_date: inspectionData.planned_date || null,
          category_id: inspectionData.category_id || schoolCategory?.id || null
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
            form_data: schoolFormData
          })
          .eq('id', editingInspection.id);

        if (updateError) throw updateError;
        inspectionResult = { id: editingInspection.id };

        // Upsert adarsha_shala record
        const { error: formError } = await supabase
          .from('adarsha_shala')
          .upsert({
            inspection_id: editingInspection.id,
            visit_date: schoolFormData.visit_date || new Date().toISOString().split('T')[0],
            school_name: schoolFormData.school_name || '',
            school_address: schoolFormData.school_address || '',
            principal_name: schoolFormData.principal_name || '',
            principal_mobile_no: schoolFormData.principal_mobile ? parseInt(schoolFormData.principal_mobile) : null,
            udise_code: schoolFormData.udise_number || '',
            center: schoolFormData.center || '',
            taluka: schoolFormData.taluka || '',
            district: schoolFormData.district || '',
            management_type: schoolFormData.management_type || '',
            self_assessment_grade: schoolFormData.school_achievement_self || null,
            external_assessment_grade: schoolFormData.school_achievement_external || null,
            sanctioned_posts: schoolFormData.sanctioned_posts || 0,
            working_posts: schoolFormData.working_posts || 0,
            present_teachers: schoolFormData.present_teachers || 0,
            math_teachers_count: schoolFormData.math_teachers_count || 0,
            registered_teachers: schoolFormData.khan_registered_teachers || 0,
            registered_students: schoolFormData.khan_registered_students || 0,
            active_students: schoolFormData.khan_active_students || 0,
            question1: schoolFormData.khan_usage_method || null,
            question2: schoolFormData.sqdp_prepared || null,
            question3: schoolFormData.sqdp_objectives_achieved || null,
            question4: schoolFormData.nipun_bharat_verification || null,
            question5: schoolFormData.learning_outcomes_assessment || null,
            question6: schoolFormData.officer_feedback || null,
            question7: schoolFormData.innovative_initiatives || null,
            question8: schoolFormData.suggested_changes || null,
            question9: schoolFormData.srujanrang_articles || null,
            question10: schoolFormData.future_articles || null,
            question11: schoolFormData.ngo_involvement || null,
            class_data: JSON.stringify([
              { class: '1', boys: 0, girls: 0, total: schoolFormData.class_enrollment['1']?.enrollment || 0 },
              { class: '2', boys: 0, girls: 0, total: schoolFormData.class_enrollment['2']?.enrollment || 0 },
              { class: '3', boys: 0, girls: 0, total: schoolFormData.class_enrollment['3']?.enrollment || 0 },
              { class: '4', boys: 0, girls: 0, total: schoolFormData.class_enrollment['4']?.enrollment || 0 },
              { class: '5', boys: 0, girls: 0, total: schoolFormData.class_enrollment['5']?.enrollment || 0 },
              { class: '6', boys: 0, girls: 0, total: schoolFormData.class_enrollment['6']?.enrollment || 0 },
              { class: '7', boys: 0, girls: 0, total: schoolFormData.class_enrollment['7']?.enrollment || 0 },
              { class: '8', boys: 0, girls: 0, total: schoolFormData.class_enrollment['8']?.enrollment || 0 }
            ]),
            subject_performance: JSON.stringify([
              { subject: 'Marathi', class_1: schoolFormData.subject_learning_outcomes['1']?.['मराठी'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['मराठी'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['मराठी'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['मराठी'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['मराठी'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['मराठी'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['मराठी'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['मराठी'] || 0 },
              { subject: 'English', class_1: schoolFormData.subject_learning_outcomes['1']?.['इंग्रजी'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['इंग्रजी'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['इंग्रजी'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['इंग्रजी'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['इंग्रजी'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['इंग्रजी'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['इंग्रजी'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['इंग्रजी'] || 0 },
              { subject: 'Math', class_1: schoolFormData.subject_learning_outcomes['1']?.['गणित'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['गणित'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['गणित'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['गणित'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['गणित'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['गणित'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['गणित'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['गणित'] || 0 },
              { subject: 'Science', class_1: schoolFormData.subject_learning_outcomes['1']?.['प.अ./विज्ञान'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['प.अ./विज्ञान'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['प.अ./विज्ञान'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['प.अ./विज्ञान'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['प.अ./विज्ञान'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['प.अ./विज्ञान'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['प.अ./विज्ञान'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['प.अ./विज्ञान'] || 0 },
              { subject: 'Social Studies', class_1: schoolFormData.subject_learning_outcomes['1']?.['इतिहास'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['इतिहास'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['इतिहास'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['इतिहास'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['इतिहास'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['इतिहास'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['इतिहास'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['इतिहास'] || 0 }
            ]),
            material_usage: JSON.stringify(Object.keys(schoolFormData.materials_usage).map(material => ({
              material: material,
              available: schoolFormData.materials_usage[material].available,
              usage: schoolFormData.materials_usage[material].usage_status,
              suggestions: schoolFormData.materials_usage[material].suggestions
            })))
          });

        if (formError) throw formError;
      } else {
        // Convert empty strings to null for database compatibility
        const createInspectionData = {
          ...inspectionData,
          planned_date: inspectionData.planned_date || null,
          category_id: inspectionData.category_id || schoolCategory?.id || null
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
            form_data: schoolFormData
          })
          .select()
          .single();

        if (createError) throw createError;
        inspectionResult = createResult;

        // Create adarsha_shala record
        const { error: formError } = await supabase
          .from('adarsha_shala')
          .insert({
            inspection_id: inspectionResult.id,
            visit_date: schoolFormData.visit_date || new Date().toISOString().split('T')[0],
            school_name: schoolFormData.school_name || '',
            school_address: schoolFormData.school_address || '',
            principal_name: schoolFormData.principal_name || '',
            principal_mobile_no: schoolFormData.principal_mobile ? parseInt(schoolFormData.principal_mobile) : null,
            udise_code: schoolFormData.udise_number || '',
            center: schoolFormData.center || '',
            taluka: schoolFormData.taluka || '',
            district: schoolFormData.district || '',
            management_type: schoolFormData.management_type || '',
            self_assessment_grade: schoolFormData.school_achievement_self || null,
            external_assessment_grade: schoolFormData.school_achievement_external || null,
            sanctioned_posts: schoolFormData.sanctioned_posts || 0,
            working_posts: schoolFormData.working_posts || 0,
            present_teachers: schoolFormData.present_teachers || 0,
            math_teachers_count: schoolFormData.math_teachers_count || 0,
            registered_teachers: schoolFormData.khan_registered_teachers || 0,
            registered_students: schoolFormData.khan_registered_students || 0,
            active_students: schoolFormData.khan_active_students || 0,
            question1: schoolFormData.khan_usage_method || null,
            question2: schoolFormData.sqdp_prepared || null,
            question3: schoolFormData.sqdp_objectives_achieved || null,
            question4: schoolFormData.nipun_bharat_verification || null,
            question5: schoolFormData.learning_outcomes_assessment || null,
            question6: schoolFormData.officer_feedback || null,
            question7: schoolFormData.innovative_initiatives || null,
            question8: schoolFormData.suggested_changes || null,
            question9: schoolFormData.srujanrang_articles || null,
            question10: schoolFormData.future_articles || null,
            question11: schoolFormData.ngo_involvement || null,
            class_data: JSON.stringify([
              { class: '1', boys: 0, girls: 0, total: schoolFormData.class_enrollment['1']?.enrollment || 0 },
              { class: '2', boys: 0, girls: 0, total: schoolFormData.class_enrollment['2']?.enrollment || 0 },
              { class: '3', boys: 0, girls: 0, total: schoolFormData.class_enrollment['3']?.enrollment || 0 },
              { class: '4', boys: 0, girls: 0, total: schoolFormData.class_enrollment['4']?.enrollment || 0 },
              { class: '5', boys: 0, girls: 0, total: schoolFormData.class_enrollment['5']?.enrollment || 0 },
              { class: '6', boys: 0, girls: 0, total: schoolFormData.class_enrollment['6']?.enrollment || 0 },
              { class: '7', boys: 0, girls: 0, total: schoolFormData.class_enrollment['7']?.enrollment || 0 },
              { class: '8', boys: 0, girls: 0, total: schoolFormData.class_enrollment['8']?.enrollment || 0 }
            ]),
            subject_performance: JSON.stringify([
              { subject: 'Marathi', class_1: schoolFormData.subject_learning_outcomes['1']?.['मराठी'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['मराठी'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['मराठी'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['मराठी'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['मराठी'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['मराठी'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['मराठी'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['मराठी'] || 0 },
              { subject: 'English', class_1: schoolFormData.subject_learning_outcomes['1']?.['इंग्रजी'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['इंग्रजी'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['इंग्रजी'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['इंग्रजी'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['इंग्रजी'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['इंग्रजी'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['इंग्रजी'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['इंग्रजी'] || 0 },
              { subject: 'Math', class_1: schoolFormData.subject_learning_outcomes['1']?.['गणित'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['गणित'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['गणित'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['गणित'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['गणित'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['गणित'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['गणित'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['गणित'] || 0 },
              { subject: 'Science', class_1: schoolFormData.subject_learning_outcomes['1']?.['प.अ./विज्ञान'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['प.अ./विज्ञान'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['प.अ./विज्ञान'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['प.अ./विज्ञान'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['प.अ./विज्ञान'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['प.अ./विज्ञान'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['प.अ./विज्ञान'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['प.अ./विज्ञान'] || 0 },
              { subject: 'Social Studies', class_1: schoolFormData.subject_learning_outcomes['1']?.['इतिहास'] || 0, class_2: schoolFormData.subject_learning_outcomes['2']?.['इतिहास'] || 0, class_3: schoolFormData.subject_learning_outcomes['3']?.['इतिहास'] || 0, class_4: schoolFormData.subject_learning_outcomes['4']?.['इतिहास'] || 0, class_5: schoolFormData.subject_learning_outcomes['5']?.['इतिहास'] || 0, class_6: schoolFormData.subject_learning_outcomes['6']?.['इतिहास'] || 0, class_7: schoolFormData.subject_learning_outcomes['7']?.['इतिहास'] || 0, class_8: schoolFormData.subject_learning_outcomes['8']?.['इतिहास'] || 0 }
            ]),
            material_usage: JSON.stringify(Object.keys(schoolFormData.materials_usage).map(material => ({
              material: material,
              available: schoolFormData.materials_usage[material].available,
              usage: schoolFormData.materials_usage[material].usage_status,
              suggestions: schoolFormData.materials_usage[material].suggestions
            })))
          });

        if (formError) throw formError;
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

    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error saving inspection: ' + error.message);
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
        const fileName = `rajya_shaishanik_${inspectionId}_${Date.now()}_${i}.${fileExt}`;

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
            description: `Rajya Shaishanik inspection photo ${i + 1}`,
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

  const renderSchoolBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <School className="h-5 w-5 mr-2 text-green-600" />
        शाळेची मूलभूत माहिती (Basic School Information)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            भेटीचा दिनांक *
          </label>
          <input
            type="date"
            value={schoolFormData.visit_date}
            onChange={(e) => setSchoolFormData(prev => ({...prev, visit_date: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचे नाव *
          </label>
          <input
            type="text"
            value={schoolFormData.school_name}
            onChange={(e) => setSchoolFormData(prev => ({...prev, school_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="शाळेचे नाव प्रविष्ट करा"
            required
            disabled={isViewMode}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचा पत्ता
          </label>
          <textarea
            value={schoolFormData.school_address}
            onChange={(e) => setSchoolFormData(prev => ({...prev, school_address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={2}
            placeholder="शाळेचा संपूर्ण पत्ता प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            मुख्याध्यापकाचे नाव
          </label>
          <input
            type="text"
            value={schoolFormData.principal_name}
            onChange={(e) => setSchoolFormData(prev => ({...prev, principal_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="मुख्याध्यापकाचे नाव प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            मोबाईल क्रमांक
          </label>
          <input
            type="tel"
            value={schoolFormData.principal_mobile}
            onChange={(e) => setSchoolFormData(prev => ({...prev, principal_mobile: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="मोबाईल क्रमांक प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळेचा युडायस क्रमांक
          </label>
          <input
            type="text"
            value={schoolFormData.udise_number}
            onChange={(e) => setSchoolFormData(prev => ({...prev, udise_number: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="UDISE क्रमांक प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            केंद्र
          </label>
          <input
            type="text"
            value={schoolFormData.center}
            onChange={(e) => setSchoolFormData(prev => ({...prev, center: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="केंद्र प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            तालुका
          </label>
          <input
            type="text"
            value={schoolFormData.taluka}
            onChange={(e) => setSchoolFormData(prev => ({...prev, taluka: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="तालुका प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            जिल्हा
          </label>
          <input
            type="text"
            value={schoolFormData.district}
            onChange={(e) => setSchoolFormData(prev => ({...prev, district: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="जिल्हा प्रविष्ट करा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शाळा व्यवस्थापन प्रकार
          </label>
          <select
            value={schoolFormData.management_type}
            onChange={(e) => setSchoolFormData(prev => ({...prev, management_type: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isViewMode}
          >
            <option value="">व्यवस्थापन प्रकार निवडा</option>
            <option value="government">सरकारी</option>
            <option value="aided">अनुदानित</option>
            <option value="private">खाजगी</option>
            <option value="other">इतर</option>
          </select>
        </div>
      </div>

      {/* School Achievement Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          शाळा सिद्धी (School Achievement)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              स्वयं-मूल्यांकनानुसार श्रेणी
            </label>
            <select
              value={schoolFormData.school_achievement_self}
              onChange={(e) => setSchoolFormData(prev => ({...prev, school_achievement_self: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">श्रेणी निवडा</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              बाह्य मूल्यांकनानुसार श्रेणी
            </label>
            <select
              value={schoolFormData.school_achievement_external}
              onChange={(e) => setSchoolFormData(prev => ({...prev, school_achievement_external: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            >
              <option value="">श्रेणी निवडा</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teacher Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-600" />
          शाळेतील शिक्षक संख्या (Teacher Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              मंजूर पदे
            </label>
            <input
              type="number"
              value={schoolFormData.sanctioned_posts}
              onChange={(e) => setSchoolFormData(prev => ({...prev, sanctioned_posts: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कार्यरत पदे
            </label>
            <input
              type="number"
              value={schoolFormData.working_posts}
              onChange={(e) => setSchoolFormData(prev => ({...prev, working_posts: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              आज उपस्थित शिक्षक संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.present_teachers}
              onChange={(e) => setSchoolFormData(prev => ({...prev, present_teachers: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Class-wise Enrollment and Attendance */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          शाळेतील इयत्तानिहाय पटसंख्या आणि उपस्थिती
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">वर्ग</th>
                <th className="border border-gray-300 px-4 py-2 text-left">पटसंख्या</th>
                <th className="border border-gray-300 px-4 py-2 text-left">उपस्थिती</th>
              </tr>
            </thead>
            <tbody>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((cls) => (
                <tr key={cls}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{cls}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      value={schoolFormData.class_enrollment[cls]?.enrollment || 0}
                      onChange={(e) => setSchoolFormData(prev => ({
                        ...prev,
                        class_enrollment: {
                          ...prev.class_enrollment,
                          [cls]: {
                            ...prev.class_enrollment[cls],
                            enrollment: parseInt(e.target.value) || 0
                          }
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                      min="0"
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      value={schoolFormData.class_enrollment[cls]?.attendance || 0}
                      onChange={(e) => setSchoolFormData(prev => ({
                        ...prev,
                        class_enrollment: {
                          ...prev.class_enrollment,
                          [cls]: {
                            ...prev.class_enrollment[cls],
                            attendance: parseInt(e.target.value) || 0
                          }
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                      min="0"
                      disabled={isViewMode}
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-300 px-4 py-2">एकूण</td>
                <td className="border border-gray-300 px-4 py-2">
                  {Object.values(schoolFormData.class_enrollment).reduce((sum, cls) => sum + (cls.enrollment || 0), 0)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {Object.values(schoolFormData.class_enrollment).reduce((sum, cls) => sum + (cls.attendance || 0), 0)}
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          स्थान माहिती (Location Information)
        </h3>
      </div>
      
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('fims.locationName')} *
          </label>
          <input
            type="text"
            value={inspectionData.location_name}
            onChange={(e) => setInspectionData(prev => ({...prev, location_name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={t('fims.enterLocationName')}
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
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शोधलेले स्थान (Location Detected)
          </label>
          <textarea
            value={inspectionData.address}
            onChange={(e) => setInspectionData(prev => ({...prev, address: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder={t('fims.enterFullAddress')}
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );

  const renderSchoolAssessmentForm = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        शैक्षणिक मूल्यांकन प्रपत्र (Educational Assessment Form)
      </h3>

      {/* Khan Academy Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          SCERTM, पुणे मार्फत गणित ई-साहित्य वापराच्या अनुषंगाने खाण अकॅडमी पोर्टल बाबतची माहिती
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              गणित विषय शिकविणाऱ्या शिक्षकांची संख्या (इयत्ता १ ते १०)
            </label>
            <input
              type="number"
              value={schoolFormData.math_teachers_count}
              onChange={(e) => setSchoolFormData(prev => ({...prev, math_teachers_count: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर नोंदणी झालेल्या शिक्षकांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_registered_teachers}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_registered_teachers: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर नोंदणी झालेल्या विद्यार्थ्यांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_registered_students}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_registered_students: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khan Academy पोर्टलवर स्वाध्याय सोडवित असलेल्या विद्यार्थ्यांची संख्या
            </label>
            <input
              type="number"
              value={schoolFormData.khan_active_students}
              onChange={(e) => setSchoolFormData(prev => ({...prev, khan_active_students: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            १. SCERTM, पुणे मार्फत Khan Academy च्या पोर्टलवर उपलब्ध करून दिलेल्या ई साहित्याचा वापर शाळेत कशाप्रकारे केला जातो?
          </label>
          <textarea
            value={schoolFormData.khan_usage_method}
            onChange={(e) => setSchoolFormData(prev => ({...prev, khan_usage_method: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="Khan Academy ई साहित्याचा वापर पद्धती वर्णन करा"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* SQDP and Assessment Questions */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            २. शैक्षणिक वर्ष २०२२-२३ मधील SQDP च्या आधारे सन २०२३-२४ साठी सुधारित SQDP तयार केला आहे का?
          </label>
          <textarea
            value={schoolFormData.sqdp_prepared}
            onChange={(e) => setSchoolFormData(prev => ({...prev, sqdp_prepared: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="SQDP तयारी बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ३. २०२२-२३ मधील शाळा गुणवत्ता विकास आराखड्यानुसार (SQDP) ठरविलेली उद्दिष्टे पूर्ण झाली आहेत काय? नसल्यास कारणे द्यावी.
          </label>
          <textarea
            value={schoolFormData.sqdp_objectives_achieved}
            onChange={(e) => setSchoolFormData(prev => ({...prev, sqdp_objectives_achieved: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="SQDP उद्दिष्टे पूर्णता बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ४. शाळेमध्ये निपुण भारत लक्ष्य पडताळणी प्रपत्र (भाषा व गणित) नुसार पडताळणी झाली का? असल्यास प्रपत्र सोबत जोडावे, नसल्यास शाळेने पडताळणी करून अहवाल प्रपत्र तपासणी अधिकाऱ्याकडे दोन दिवसात सादर करावा.
          </label>
          <textarea
            value={schoolFormData.nipun_bharat_verification}
            onChange={(e) => setSchoolFormData(prev => ({...prev, nipun_bharat_verification: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="निपुण भारत पडताळणी बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ५. सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार किती विद्यार्थ्यामध्ये अध्ययन निष्पती दिसून येते (न्यादर्श पद्धतीने कोणत्याही एका वर्गाची, सर्व विषयाची अध्ययन निष्पती तपासावी)
          </label>
          <textarea
            value={schoolFormData.learning_outcomes_assessment}
            onChange={(e) => setSchoolFormData(prev => ({...prev, learning_outcomes_assessment: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="अध्ययन निष्पती मूल्यांकन तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Subject-wise Learning Outcomes Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          वर्गनिहाय विषय अध्ययन निष्पती
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">वर्ग</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">मराठी</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">गणित</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">इंग्रजी</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">प.अ./विज्ञान</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">इतिहास</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">भूगोल</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">हिंदी</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">शा.शि.</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">कार्यनुभव</th>
              </tr>
            </thead>
            <tbody>
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((cls) => (
                <tr key={cls}>
                  <td className="border border-gray-300 px-2 py-1 font-medium text-sm">{cls}</td>
                  {['मराठी', 'गणित', 'इंग्रजी', 'प.अ./विज्ञान', 'इतिहास', 'भूगोल', 'हिंदी', 'शा.शि.', 'कार्यनुभव'].map((subject) => (
                    <td key={subject} className="border border-gray-300 px-1 py-1">
                      <input
                        type="number"
                        value={schoolFormData.subject_learning_outcomes[cls]?.[subject] || 0}
                        onChange={(e) => setSchoolFormData(prev => ({
                          ...prev,
                          subject_learning_outcomes: {
                            ...prev.subject_learning_outcomes,
                            [cls]: {
                              ...prev.subject_learning_outcomes[cls],
                              [subject]: parseInt(e.target.value) || 0
                            }
                          }
                        }))}
                        className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                        min="0"
                        disabled={isViewMode}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-300 px-2 py-1 text-sm">एकूण</td>
                {['मराठी', 'गणित', 'इंग्रजी', 'प.अ./विज्ञान', 'इतिहास', 'भूगोल', 'हिंदी', 'शा.शि.', 'कार्यनुभव'].map((subject) => (
                  <td key={subject} className="border border-gray-300 px-2 py-1 text-sm">
                    {Object.keys(schoolFormData.subject_learning_outcomes).reduce((sum, cls) => 
                      sum + (schoolFormData.subject_learning_outcomes[cls]?.[subject] || 0), 0
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Questions */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ६. शाळा भेट देणाऱ्या अधिकाऱ्यांनी सध्या शिकवत असलेल्या इयत्तावार व विषयवार घटकानुसार अध्ययन निष्पती तपासल्या नंतर विद्यार्थ्यांच्या संपादणुकीबाबत / विद्यार्थी प्रगती बाबत अभिप्राय द्यावा.
          </label>
          <textarea
            value={schoolFormData.officer_feedback}
            onChange={(e) => setSchoolFormData(prev => ({...prev, officer_feedback: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="अधिकाऱ्यांचे अभिप्राय द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ७. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरीता शाळेमध्ये नाविन्यपूर्ण उपक्रम राबविले आहेत का? असल्यास कोणते?
          </label>
          <textarea
            value={schoolFormData.innovative_initiatives}
            onChange={(e) => setSchoolFormData(prev => ({...prev, innovative_initiatives: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="नाविन्यपूर्ण उपक्रमांचे तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ८. विद्यार्थ्यामध्ये शैक्षणिक गुणवत्ता निर्माण होण्याकरिता व सदर शाळा तालुक्यातील इतर शाळांना मार्गदर्शक व्हावी यासाठी भेट देणाऱ्या अधिकाऱ्यांच्या मते शाळेत कोणत्या बदलाची आवश्यकता आहे?
          </label>
          <textarea
            value={schoolFormData.suggested_changes}
            onChange={(e) => setSchoolFormData(prev => ({...prev, suggested_changes: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            placeholder="सुधारणेसाठी सूचना द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ९. सृजनरंग या ई अंकामध्ये शाळेद्वारा लेख तसेच यशोगाथा पाठविले आहे का? असल्यास सृजनरंग या ई अंकामध्ये प्रसिद्ध झाला आहे का
          </label>
          <textarea
            value={schoolFormData.srujanrang_articles}
            onChange={(e) => setSchoolFormData(prev => ({...prev, srujanrang_articles: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="सृजनरंग लेख बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            १०. सृजनरंग या पुढील ई अंकांसाठी लेख पाठवले आहेत का?
          </label>
          <textarea
            value={schoolFormData.future_articles}
            onChange={(e) => setSchoolFormData(prev => ({...prev, future_articles: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="भविष्यातील लेख बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ११. शाळेमध्ये काम करत असलेल्या स्वयंसेवी संस्था कार्यरत आहेत? असल्यास कोणत्या विषयाच्या अनुषंगाने काम करत आहेत.
          </label>
          <textarea
            value={schoolFormData.ngo_involvement}
            onChange={(e) => setSchoolFormData(prev => ({...prev, ngo_involvement: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="स्वयंसेवी संस्था बाबत तपशील द्यावा"
            disabled={isViewMode}
          />
        </div>
      </div>

      {/* Materials and Technology Usage Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          शाळेतील साहित्याचा / तंत्रज्ञानाचा अध्ययन-अध्यापनात वापर
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">अ.क्र.</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">तपशील</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">उपलब्ध आहे का?</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">अध्ययन-अध्यापन प्रक्रियेत वापराची सद्यस्थिती</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-sm">सुधारणात्मक सूचना</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(schoolFormData.materials_usage).map((material, idx) => (
                <tr key={material}>
                  <td className="border border-gray-300 px-2 py-1 text-sm">{idx + 1}</td>
                  <td className="border border-gray-300 px-2 py-1 text-sm">{material}</td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="checkbox"
                      checked={schoolFormData.materials_usage[material]?.available || false}
                      onChange={(e) => setSchoolFormData(prev => ({
                        ...prev,
                        materials_usage: {
                          ...prev.materials_usage,
                          [material]: {
                            ...prev.materials_usage[material],
                            available: e.target.checked
                          }
                        }
                      }))}
                      className="w-4 h-4"
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <textarea
                      value={schoolFormData.materials_usage[material]?.usage_status || ''}
                      onChange={(e) => setSchoolFormData(prev => ({
                        ...prev,
                        materials_usage: {
                          ...prev.materials_usage,
                          [material]: {
                            ...prev.materials_usage[material],
                            usage_status: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                      rows={2}
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <textarea
                      value={schoolFormData.materials_usage[material]?.suggestions || ''}
                      onChange={(e) => setSchoolFormData(prev => ({
                        ...prev,
                        materials_usage: {
                          ...prev.materials_usage,
                          [material]: {
                            ...prev.materials_usage[material],
                            suggestions: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-1 py-1 border border-gray-200 rounded text-xs"
                      rows={2}
                      disabled={isViewMode}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Upload School Photos
          </h4>
          <p className="text-gray-600 mb-4">
            Upload photos of the school for documentation and record keeping
          </p>
          
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
                  alt={`School photo ${index + 1}`}
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
                  alt={photo.description || `School photo ${index + 1}`}
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

      {/* Inspector Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-green-600" />
          निरीक्षण अधिकारी माहिती (Inspector Information)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              निरीक्षण अधिकाऱ्याचे नाव
            </label>
            <input
              type="text"
              value={schoolFormData.inspector_name}
              onChange={(e) => setSchoolFormData(prev => ({...prev, inspector_name: e.target.value}))}
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
              value={schoolFormData.inspector_designation}
              onChange={(e) => setSchoolFormData(prev => ({...prev, inspector_designation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="पदनाम प्रविष्ट करा"
              disabled={isViewMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              भेटीचा दिनांक
            </label>
            <input
              type="date"
              value={schoolFormData.visit_date_inspector}
              onChange={(e) => setSchoolFormData(prev => ({...prev, visit_date_inspector: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderSchoolBasicInfo();
      case 2:
        return renderLocationDetails();
      case 3:
        return renderSchoolAssessmentForm();
      case 4:
        return renderPhotoUpload();
      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return schoolFormData.visit_date && schoolFormData.school_name;
      case 2:
        return inspectionData.location_name;
      case 3:
        return true; // Assessment form is optional, can proceed
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
            <div className="text-center">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                राज्य शैक्षणिक संशोधन व प्रशिक्षण परिषद, महाराष्ट्र, पुणे
              </h1>
              <h2 className="text-md md:text-lg font-semibold text-gray-700">
                आदर्श शाळा भेट प्रपत्र
              </h2>
            </div>
            <div className="w-20"></div>
          </div>

          {renderStepIndicator()}

          <div className="flex justify-center space-x-4 md:space-x-8 text-xs md:text-sm">
            <div className={`${currentStep === 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              शाळेची माहिती
            </div>
            <div className={`${currentStep === 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {t('fims.locationDetails')}
            </div>
            <div className={`${currentStep === 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              शैक्षणिक मूल्यांकन
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