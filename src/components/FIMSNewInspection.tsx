import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Camera,
  MapPin,
  Building2,
  School,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  UserCheck,
  ClipboardList,
  Award,
  Target,
  CheckSquare,
  FileCheck,
  UserPlus,
  Settings,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnganwadiTapasaniForm } from './AnganwadiTapasaniForm';
import { FIMSOfficeInspection } from './FIMSOfficeInspection';
import { RajyaShaishanikPrashikshanForm } from './RajyaShaishanikPrashikshanForm';
import { BandhakamVibhag1Form} from './BandhakamVibhag1';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface FIMSNewInspectionProps {
  user: SupabaseUser;
  onBack: () => void;
  categories: any[];
  onInspectionCreated: () => void;
  editingInspection?: any;
}

export const FIMSNewInspection: React.FC<FIMSNewInspectionProps> = ({
  user,
  onBack,
  categories,
  onInspectionCreated,
  editingInspection
}) => {
  const { t } = useTranslation();
  const [selectedInspectionType, setSelectedInspectionType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // All hooks must be called before any conditional logic
  useEffect(() => {
    // If we have an editing inspection, auto-select the inspection type
    if (editingInspection && categories.length > 0) {
      const category = categories.find(cat => cat.id === editingInspection.category_id);
      if (category) {
        setSelectedInspectionType(category.form_type);
      }
    }
  }, [editingInspection, categories]);

  // Auto-navigate to form if editing an existing inspection
  useEffect(() => {
    if (editingInspection && editingInspection.id && categories.length > 0) {
      const category = categories.find(cat => cat.id === editingInspection.category_id);
      if (category && category.form_type) {
        setSelectedInspectionType(category.form_type);
      }
    }
  }, [editingInspection, categories]);

  // Handle inspection type selection
  const handleInspectionTypeSelect = (type: string) => {
    setSelectedInspectionType(type);
  };

  // Handle back navigation
  const handleBackToSelection = () => {
    // Only allow back to selection if not editing an existing inspection
    if (editingInspection && editingInspection.id) {
      onBack(); // Go back to dashboard instead
      return;
    }
    setSelectedInspectionType(null);
  };

  // Render the appropriate inspection form based on selection
  const renderInspectionForm = () => {
    if (selectedInspectionType === 'anganwadi') {
      return (
        <AnganwadiTapasaniForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'office') {
      return (
        <FIMSOfficeInspection
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    if (selectedInspectionType === 'rajya_shaishanik') {
      return (
        <RajyaShaishanikPrashikshanForm
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }
    if (selectedInspectionType === 'BandhakamVibhag1') {
      return (
        <BandhakamVibhag1
          user={user}
          onBack={handleBackToSelection}
          categories={categories}
          onInspectionCreated={onInspectionCreated}
          editingInspection={editingInspection}
        />
      );
    }

    return null;
  };

  // If an inspection type is selected, render the form
  if (selectedInspectionType) {
    return renderInspectionForm();
  }

  // Default view - inspection type selection
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              {t('fims.newInspection')}
            </h1>
            <div className="w-20"></div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 text-center">
            {t('fims.selectCategory')}
          </p>
        </div>

        {/* Inspection Type Selection - Updated to support more forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Anganwadi Inspection */}
          <div 
            onClick={() => handleInspectionTypeSelect('anganwadi')}
            className="bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 rounded-lg shadow-lg border-2 border-purple-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-purple-400 touch-manipulation hover:from-purple-200 hover:via-purple-100 hover:to-pink-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  अंगणवाडी केंद्र तपासणी
                </h3>
                <p className="text-sm md:text-base text-purple-700 font-medium">
                  अंगणवाडी केंद्र तपासणी
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-purple-800">
              <p>• पायाभूत सुविधा आणि सुविधांचे मूल्यांकन</p>
              <p>• उपकरणे आणि साहित्य सत्यापन</p>
              <p>• मुलांची माहिती आणि नोंदी</p>
              <p>• पोषण आणि आरोग्य सेवा</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-purple-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Office Inspection */}
          <div 
            onClick={() => handleInspectionTypeSelect('office')}
            className="bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-lg shadow-lg border-2 border-blue-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-blue-400 touch-manipulation hover:from-blue-200 hover:via-blue-100 hover:to-cyan-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  दफ्तर निरीक्षण प्रपत्र
                </h3>
                <p className="text-sm md:text-base text-blue-700 font-medium">
                  दफ्तर निरीक्षण
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-blue-800">
              <p>• कर्मचारी माहिती आणि कामाचे स्वरूप</p>
              <p>• पत्र व्यवहार तपशील तपासणी</p>
              <p>• नोंदवह्या आणि दप्तरची रचना</p>
              <p>• कामाचा दर्जा मूल्यांकन</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Rajya Shaishanik Prashikshan Form */}
          <div 
            onClick={() => handleInspectionTypeSelect('rajya_shaishanik')}
            className="bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-lg shadow-lg border-2 border-green-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-green-400 touch-manipulation hover:from-green-200 hover:via-green-100 hover:to-emerald-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <School className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  आदर्श शाळा भेट प्रपत्र
                </h3>
                <p className="text-sm md:text-base text-green-700 font-medium">
                  राज्य शैक्षणिक संशोधन व प्रशिक्षण
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-green-800">
              <p>• शाळेची माहिती आणि पटसंख्या</p>
              <p>• Khan Academy पोर्टल वापर</p>
              <p>• SQDP आणि निपुण भारत लक्ष्य</p>
              <p>• शैक्षणिक गुणवत्ता मूल्यांकन</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-green-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* bandhakamvibhag1 */}
          <div 
            onClick={() => handleInspectionTypeSelect('BandahkamVibhag1')}
            className="bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-lg shadow-lg border-2 border-green-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-green-400 touch-manipulation hover:from-green-200 hover:via-green-100 hover:to-emerald-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <School className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  आदर्श शाळा भेट प्रपत्र
                </h3>
                <p className="text-sm md:text-base text-green-700 font-medium">
                  राज्य शैक्षणिक संशोधन व प्रशिक्षण
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-green-800">
              <p>• शाळेची माहिती आणि पटसंख्या</p>
              <p>• Khan Academy पोर्टल वापर</p>
              <p>• SQDP आणि निपुण भारत लक्ष्य</p>
              <p>• शैक्षणिक गुणवत्ता मूल्यांकन</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-green-700 bg-white/50 px-3 py-1 rounded-full">
                तपासणी सुरू करण्यासाठी निवडा
              </span>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          

          {/* Placeholder cards for the remaining 12 forms */}
          {[
            { key: 'form_4', title: 'BandhakamVibhag1', subtitle: 'BandhakamVibhag1', color: 'orange' },
            { key: 'form_5', title: 'Form 5 Title', subtitle: 'Form 5 Description', color: 'indigo' },
            { key: 'form_6', title: 'Form 6 Title', subtitle: 'Form 6 Description', color: 'pink' },
            { key: 'form_7', title: 'Form 7 Title', subtitle: 'Form 7 Description', color: 'teal' },
            { key: 'form_8', title: 'Form 8 Title', subtitle: 'Form 8 Description', color: 'red' },
            { key: 'form_9', title: 'Form 9 Title', subtitle: 'Form 9 Description', color: 'yellow' },
            { key: 'form_10', title: 'Form 10 Title', subtitle: 'Form 10 Description', color: 'cyan' },
            { key: 'form_11', title: 'Form 11 Title', subtitle: 'Form 11 Description', color: 'violet' },
            { key: 'form_12', title: 'Form 12 Title', subtitle: 'Form 12 Description', color: 'lime' },
            { key: 'form_13', title: 'Form 13 Title', subtitle: 'Form 13 Description', color: 'amber' },
            { key: 'form_14', title: 'Form 14 Title', subtitle: 'Form 14 Description', color: 'emerald' },
            { key: 'form_15', title: 'Form 15 Title', subtitle: 'Form 15 Description', color: 'rose' }
          ].map((form, index) => (
            <div 
              key={form.key}
              onClick={() => alert(`${form.title} - Coming Soon!`)}
              className={`bg-gradient-to-br from-${form.color}-100 via-${form.color}-50 to-${form.color}-50 rounded-lg shadow-lg border-2 border-${form.color}-200 p-4 md:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer hover:border-${form.color}-400 touch-manipulation opacity-75`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`bg-gradient-to-br from-${form.color}-500 to-${form.color}-600 p-3 rounded-xl shadow-lg`}>
                  <FileCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    {form.title}
                  </h3>
                  <p className={`text-sm md:text-base text-${form.color}-700 font-medium`}>
                    {form.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Feature 1</p>
                <p>• Feature 2</p>
                <p>• Feature 3</p>
                <p>• Feature 4</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-bold text-${form.color}-700 bg-white/50 px-3 py-1 rounded-full`}>
                  Coming Soon
                </span>
                <div className={`bg-gradient-to-r from-${form.color}-500 to-${form.color}-600 p-2 rounded-full shadow-lg`}>
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-100 via-cyan-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md">
              <Camera className="h-5 w-5 text-white flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-base font-bold text-blue-900 mb-2">
                {t('fims.photoDocumentationRequired')}
              </h4>
              <p className="text-sm text-blue-800 font-medium">
                {t('fims.photoDocumentationRequiredDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-4 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg shadow-md">
              <MapPin className="h-5 w-5 text-white flex-shrink-0" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-900 mb-2">
                {t('fims.gpsLocationCaptureRequired')}
              </h4>
              <p className="text-sm text-amber-800 font-medium">
                {t('fims.gpsLocationCaptureDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};