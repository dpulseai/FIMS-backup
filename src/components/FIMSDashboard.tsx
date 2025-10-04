import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  ArrowLeft,
  Camera,
  BarChart3,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  X,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  Home,
  PieChart,
  Globe,
  Check
} from 'lucide-react';
import {
  fetchInspectionStats,
  getInspections,
  fetchCategories,
  fetchInspectors,
  deleteInspection,
  reassignInspection,
  updateInspectionStatus,
  type InspectionStats,
  type InspectionData,
  type CategoryData,
  type InspectorData
} from '../services/fimsService';
import { usePermissions } from '../hooks/usePermissions';
import { FIMSAnalytics } from './FIMSAnalytics';
import { FIMSNewInspection } from './FIMSNewInspection';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Mobile detection utility
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

interface FIMSDashboardProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

interface Inspection {
  id: string;
  inspection_number: string;
  category_id: string;
  inspector_id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  address: string | null;
  planned_date: string | null;
  inspection_date: string | null;
  status: string;
  form_data: any;
  is_compliant: boolean | null;
  requires_revisit: boolean;
  created_at: string;
  updated_at: string;
  anganwadi_forms?: any;
  photos?: InspectionPhoto[];
}

interface Category {
  id: string;
  name: string;
  name_marathi: string;
  description: string;
  form_type: string;
  is_active: boolean;
}

interface InspectionPhoto {
  id: string;
  photo_url: string;
  photo_name: string | null;
  description: string | null;
  photo_order: number;
  uploaded_at: string;
}

export const FIMSDashboard: React.FC<FIMSDashboardProps> = ({ user, onSignOut }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Get translation function
  
  const [isLoading, setIsLoading] = useState(false);
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [inspectors, setInspectors] = useState<InspectorData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [viewingPhotos, setViewingPhotos] = useState<InspectionPhoto[]>([]);
  const [editingInspection, setEditingInspection] = useState<InspectionData | null>(null);
  const [showRevisitModal, setShowRevisitModal] = useState(false);
  const [revisitInspectionId, setRevisitInspectionId] = useState<string>('');
  const [availableInspectors, setAvailableInspectors] = useState<any[]>([]);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const viewingInspection = editingInspection?.mode === 'view';

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data using service functions
      const [inspectionsData, categoriesData, inspectorsData] = await Promise.all([
        getInspections(user.id),
        fetchCategories(),
        fetchInspectors()
      ]);

      setInspections(inspectionsData);
      setCategories(categoriesData);
      setAvailableInspectors(inspectorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInspectionsData = async () => {
    try {
      console.log('🔍 Fetching inspections...');
      
      const { supabase } = await import('../lib/supabase');
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('fims_inspections')
        .select(`
          *,
          fims_categories(name, name_marathi),
          fims_anganwadi_forms(*),
          fims_office_inspection_forms(*),
          fims_inspection_photos(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('✅ Inspections fetched successfully:', data?.length || 0);
      setInspections(data || []);
    } catch (error) {
      console.error('❌ Error in fetchInspections:', error);
      
      // Provide user-friendly error message
      if (error.message.includes('Failed to fetch')) {
        alert('Network connection error. Please check your internet connection and try again.');
      } else if (error.message.includes('JWT')) {
        alert('Session expired. Please sign in again.');
      } else {
        alert(`Error loading inspections: ${error.message}`);
      }
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;

      const { data, error } = await supabase
        .from('fims_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableInspectors = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          name,
          roles!inner(name)
        `)
        .in('roles.name', ['inspector', 'officer', 'admin'])
        .not('name', 'is', null);
      
      if (error) throw error;
      setAvailableInspectors(data || []);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteInspection = async (inspectionId: string) => {
    if (!confirm(t('fims.confirmDeleteInspection') || 'Are you sure you want to delete this inspection?')) return;

    try {
      setIsLoading(true);
      
      await deleteInspection(inspectionId);
      alert(t('fims.inspectionDeletedSuccessfully') || 'Inspection deleted successfully');
      await fetchInspectionsData();
      
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(t('fims.errorDeletingInspection') || 'Error deleting inspection: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteInspection = async (inspectionId: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;

      const { error } = await supabase
        .from('fims_inspections')
        .update({ status: 'approved' })
        .eq('id', inspectionId);
      
      if (error) throw error;
      
      await fetchInspectionsData();
      alert('Inspection marked as completed');
    } catch (error) {
      console.error('Error completing inspection:', error);
      alert('Error completing inspection: ' + error.message);
    }
  };

  const handleRevisitInspection = (inspectionId: string) => {
    setRevisitInspectionId(inspectionId);
    setSelectedInspector('');
    setShowRevisitModal(true);
  };

  const handleConfirmRevisit = async () => {
    if (!selectedInspector) {
      alert('Please select an inspector for revisit');
      return;
    }

    try {
      setIsLoading(true);
      
      await reassignInspection(revisitInspectionId, selectedInspector);
      alert('Inspection assigned for revisit successfully');
      setShowRevisitModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error sending for revisit:', error);
      alert('Error sending for revisit: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInspectionPhotos = async (inspection: Inspection) => {
    try {
      const { supabase } = await import('../lib/supabase');
      if (!supabase) return;

      const { data, error } = await supabase
        .from('fims_inspection_photos')
        .select('*')
        .eq('inspection_id', inspection.id)
        .order('photo_order');

      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert(t('fims.noPhotosFound', 'No photos found for this inspection'));
        return;
      }
      
      setViewingPhotos(data || []);
      setSelectedPhotoIndex(0);
      setShowPhotoModal(true);
    } catch (error) {
      console.error('Error loading photos:', error);
      alert('Error loading photos: ' + error.message);
    }
  };

  const getFilteredInspections = () => {
    return inspections.filter(inspection => {
      const matchesSearch = searchTerm === '' || 
        inspection.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.inspection_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || inspection.category_id === selectedCategory;
      const matchesStatus = selectedStatus === '' || inspection.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const getStatusCounts = () => {
    const total = inspections.length;
    const pending = inspections.filter(i => ['planned', 'in_progress', 'draft'].includes(i.status)).length;
    const completed = inspections.filter(i => i.status === 'approved').length;
    const submitted = inspections.filter(i => i.status === 'submitted').length;
    
    return { total, pending, completed, submitted };
  };

  const getCompletionRate = () => {
    const { total, completed } = getStatusCounts();
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'submitted':
      case 'under_review':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
      case 'draft':
      case 'pending':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      case 'reassigned':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    return t(`statuses.${status}`, status.toUpperCase());
  };

  // Mobile navigation items (only essential features)
  const mobileNavItems = [
    {
      id: 'dashboard',
      icon: Home,
      title: t('fims.dashboard'),
      description: t('dashboard.overview'),
      color: 'bg-purple-500'
    },
    {
      id: 'inspections',
      icon: FileText,
      title: t('fims.inspections'),
      description: t('fims.viewAndManageInspections'),
      color: 'bg-blue-500'
    },
    {
      id: 'newInspection',
      icon: Plus,
      title: t('fims.newInspection'),
      description: t('fims.createNewInspection'),
      color: 'bg-green-500'
    }
  ];

  const renderMobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMobileHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Camera className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">FIMS</h1>
            <p className="text-xs text-gray-500">Field Inspection</p>
          </div>
        </div>
        
        {/* Mobile Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="bg-purple-100 p-1.5 rounded-full">
              <User className="h-4 w-4 text-purple-600" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      Field Inspector
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                  <User className="h-4 w-4" />
                  <span>{t('profile.userProfile')}</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                  <Settings className="h-4 w-4" />
                  <span>{t('navigation.settings')}</span>
                </button>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('auth.signOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (activeTab === 'analytics') {
    return (
      <FIMSAnalytics
        user={user}
        onBack={() => setActiveTab('dashboard')}
      />
    );
  }

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('fims.totalInspections')}</p>
              <p className="text-3xl font-bold">{getStatusCounts().total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('fims.completed')}</p>
              <p className="text-3xl font-bold">{getStatusCounts().completed}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">{t('fims.pending')}</p>
              <p className="text-3xl font-bold">{getStatusCounts().pending}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('fims.successRate')}</p>
              <p className="text-3xl font-bold">{getCompletionRate()}%</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-xl shadow-lg border-2 border-blue-200 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-6 w-6 mr-2 text-blue-600" />
          {t('fims.quickActions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('newInspection')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:shadow-lg hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">{t('fims.newInspection')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('inspections')}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-4 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:shadow-lg hover:scale-105"
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">{t('fims.inspections')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white p-4 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:shadow-lg hover:scale-105"
          >
            <PieChart className="h-5 w-5" />
            <span className="font-medium">{t('fims.analytics')}</span>
          </button>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('fims.recentInspections')}</h3>
        </div>
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.inspectionNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.location')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.category')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.slice(0, 5).map((inspection) => {
                const category = categories.find(c => c.id === inspection.category_id);
                return (
                <tr key={inspection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inspection.inspection_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.location_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category ? t(`categories.${category.form_type}`, category.name) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inspection.status === 'approved' ? 'bg-green-100 text-green-800' :
                      inspection.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      inspection.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      inspection.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      inspection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      inspection.status === 'reassigned' ? 'bg-purple-100 text-purple-800' :
                      inspection.status === 'under_review' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(inspection.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingInspection({...inspection, mode: 'view'});
                        setActiveTab('newInspection');
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Inspection"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Recent Inspections */}
        <div className="md:hidden">
          {inspections.slice(0, 5).map((inspection) => {
            const category = categories.find(c => c.id === inspection.category_id);
            return (
              <div key={inspection.id} className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm">
                    {inspection.inspection_number}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    inspection.status === 'approved' ? 'bg-green-100 text-green-800' :
                    inspection.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    inspection.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    inspection.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    inspection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    inspection.status === 'reassigned' ? 'bg-purple-100 text-purple-800' :
                    inspection.status === 'under_review' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(inspection.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {inspection.location_name}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category ? t(`categories.${category.form_type}`, category.name) : '-'}</span>
                  <span>
                    {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('fims.inspections')}</h3>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('newInspection')}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 text-sm md:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>{t('fims.newInspection')}</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('fims.searchInspections')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          >
            <option value="">{t('fims.allCategories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {t(`categories.${category.form_type}`, category.name)}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          >
            <option value="">{t('fims.allStatuses')}</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reassigned">Reassigned</option>
            <option value="under_review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('fims.inspections')}</h3>
        </div>
        
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 divide-y divide-blue-200">
            <thead className="bg-gray-50">
              <tr className="bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-100 border-b-2 border-blue-300">
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-gradient-to-r from-blue-300 to-blue-200 shadow-sm">
                  {t('fims.inspectionNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.location')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.category')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-gradient-to-r from-blue-300 to-blue-200 shadow-sm">
                  {t('fims.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fims.locationAccuracy')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-gradient-to-r from-blue-300 to-blue-200 shadow-sm">
                  {t('fims.actions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complete/Revisit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredInspections().length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    {t('fims.noInspectionsFound')}
                  </td>
                </tr>
              ) : (
                getFilteredInspections().map((inspection, index) => {
                  const category = categories.find(c => c.id === inspection.category_id);
                  return (
                    <tr 
                      key={inspection.id} 
                      className={`
                        ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gradient-to-r from-white to-blue-25'}
                        hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 
                        transition-all duration-300 ease-in-out
                        border-l-4 border-transparent hover:border-blue-400
                      `}
                    >
                      <td className="px-6 py-4 text-blue-800 hover:text-blue-600 transition-colors duration-200">
                        <div className="text-sm text-blue-500 hover:text-blue-400 truncate max-w-xs transition-colors duration-200">
                          {inspection.inspection_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors duration-200">
                        <div>
                          <div className="font-medium">{inspection.location_name}</div>
                          {inspection.address && (
                            <div className="text-xs text-gray-500">{inspection.address}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800 hover:text-blue-600 transition-colors duration-200">
                        {category ? t(`categories.${category.form_type}`, category.name) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inspection.status === 'approved' ? 'bg-green-100 text-green-800' :
                          inspection.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          inspection.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          inspection.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                          inspection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          inspection.status === 'reassigned' ? 'bg-purple-100 text-purple-800' :
                          inspection.status === 'under_review' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(inspection.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 
                         inspection.planned_date ? new Date(inspection.planned_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.location_accuracy ? `${Math.round(inspection.location_accuracy)}m` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 hover:text-blue-500 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingInspection({...inspection, mode: 'view'});
                              setActiveTab('newInspection');
                            }}
                            className="
                              bg-gradient-to-r from-blue-500 to-blue-600 
                              hover:from-blue-600 hover:to-blue-700
                              text-white px-3 py-1 rounded-lg shadow-md
                              hover:shadow-lg hover:scale-105 
                              transition-all duration-200
                              flex items-center space-x-1
                            "
                            title="View Inspection"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs font-medium">View</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingInspection({...inspection, mode: 'edit'});
                              setActiveTab('newInspection');
                            }}
                            className="
                              bg-gradient-to-r from-green-500 to-green-600 
                              hover:from-green-600 hover:to-green-700
                              text-white px-3 py-1 rounded-lg shadow-md
                              hover:shadow-lg hover:scale-105 
                              transition-all duration-200
                              flex items-center space-x-1
                            "
                            title="Edit Inspection"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInspection(inspection.id)}
                            className="
                              bg-gradient-to-r from-red-500 to-red-600 
                              hover:from-red-600 hover:to-red-700
                              text-white px-3 py-1 rounded-lg shadow-md
                              hover:shadow-lg hover:scale-105 
                              transition-all duration-200
                              flex items-center space-x-1
                            "
                            title="Delete Inspection"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewInspectionPhotos(inspection)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="View Photos"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCompleteInspection(inspection.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                            title="Complete"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleRevisitInspection(inspection.id)}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded"
                            title="Revisit"
                          >
                            Revisit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden">
          {getFilteredInspections().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('fims.noInspectionsFound')}
            </div>
          ) : (
            getFilteredInspections().map((inspection) => {
              const category = categories.find(c => c.id === inspection.category_id);
              return (
                <div key={inspection.id} className="border-b border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 text-sm">
                      {inspection.inspection_number}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      inspection.status === 'approved' ? 'bg-green-100 text-green-800' :
                      inspection.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      inspection.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      inspection.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      inspection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      inspection.status === 'reassigned' ? 'bg-purple-100 text-purple-800' :
                      inspection.status === 'under_review' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(inspection.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    <div className="font-medium">{inspection.location_name}</div>
                    {inspection.address && (
                      <div className="text-xs text-gray-500 mt-1">{inspection.address}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{category ? t(`categories.${category.form_type}`, category.name) : '-'}</span>
                    <span>
                      {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 
                       inspection.planned_date ? new Date(inspection.planned_date).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingInspection({...inspection, mode: 'view'});
                          setActiveTab('newInspection');
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingInspection({...inspection, mode: 'edit'});
                          setActiveTab('newInspection');
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewInspectionPhotos(inspection)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                        title="Photos"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCompleteInspection(inspection.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleRevisitInspection(inspection.id)}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded"
                      >
                        Revisit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">{t('fims.comingSoon')}</p>
      <p className="text-gray-400 text-sm mt-2">Analytics and reporting features will be available soon.</p>
    </div>
  );

  const renderReports = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">{t('fims.comingSoon')}</p>
      <p className="text-gray-400 text-sm mt-2">Reports and export features will be available soon.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && renderMobileHeader()}

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-full shadow-lg">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  FIMS
                </h1>
                <p className="text-gray-600">{t('fims.fullName')}</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>{t('fims.dashboard')}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('inspections')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'inspections'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>{t('fims.inspections')}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('newInspection')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'newInspection'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('fims.newInspection')}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>{t('fims.analytics')}</span>
                </button>
              </nav>
              
              <LanguageSwitcher />
              
              {/* Desktop Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <div className="bg-purple-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.email?.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500">
                            Field Inspector
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <User className="h-4 w-4" />
                        <span>{t('profile.userProfile')}</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <Settings className="h-4 w-4" />
                        <span>{t('navigation.settings')}</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('auth.signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 md:p-6 overflow-y-auto h-full pb-20 md:pb-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'inspections' && renderInspections()}
          {activeTab === 'newInspection' && (
            <FIMSNewInspection 
              user={user} 
              onBack={() => {
                setEditingInspection(null);
                setActiveTab('dashboard');
              }}
              categories={categories}
              onInspectionCreated={fetchInspectionsData}
              editingInspection={editingInspection}
            />
          )}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && renderMobileNavigation()}

      {/* Photo Modal */}
      {showPhotoModal && viewingPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Photo {selectedPhotoIndex + 1} of {viewingPhotos.length}
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={viewingPhotos[selectedPhotoIndex]?.photo_url}
                alt={viewingPhotos[selectedPhotoIndex]?.photo_name || 'Inspection photo'}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {viewingPhotos[selectedPhotoIndex]?.description}
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={() => setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1))}
                  disabled={selectedPhotoIndex === 0}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex(Math.min(viewingPhotos.length - 1, selectedPhotoIndex + 1))}
                  disabled={selectedPhotoIndex === viewingPhotos.length - 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revisit Assignment Modal */}
      {showRevisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('fims.assignForRevisit', 'Assign for Revisit')}
              </h3>
              <button
                onClick={() => setShowRevisitModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fims.selectInspector', 'Select Inspector')}
                </label>
                <select
                  value={selectedInspector}
                  onChange={(e) => setSelectedInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">{t('fims.chooseInspector', 'Choose Inspector')}</option>
                  {availableInspectors.map(inspector => (
                    <option key={inspector.user_id} value={inspector.user_id}>
                      {inspector.name} ({inspector.roles?.name || 'Inspector'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      {t('fims.revisitNote', 'This inspection will be reassigned to the selected inspector for revisit. The status will be changed to "In Progress".')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRevisitModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmRevisit}
                disabled={isLoading || !selectedInspector}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? t('common.saving') : t('fims.assignForRevisit', 'Assign for Revisit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};