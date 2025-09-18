import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';

export interface Inspection {
  id: string;
  inspection_number: string;
  category_id: string;
  inspector_id: string;
  assigned_by?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
  location_detected?: string;
  address?: string;
  planned_date?: string;
  inspection_date?: string;
  status: 'planned' | 'in_progress' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reassigned';
  form_data?: any;
  reviewed_by?: string;
  reviewed_at?: string;
  review_comments?: string;
  approved_by?: string;
  approved_at?: string;
  is_compliant?: boolean;
  non_compliance_reason?: string;
  requires_revisit?: boolean;
  created_at: string;
  updated_at: string;
  fims_categories?: {
    id: string;
    name: string;
    name_marathi: string;
    form_type: string;
  };
  fims_inspection_photos?: Array<{
    id: string;
    photo_url: string;
    photo_name?: string;
    description?: string;
    photo_order?: number;
  }>;
  fims_anganwadi_forms?: any[];
  fims_office_inspection_forms?: any[];
  fims_school_inspection_forms?: any[];
}

export const getInspections = async (userId?: string): Promise<Inspection[]> => {
  // Return empty array immediately if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning empty inspections list');
    return [];
  }

  try {
    let query = supabase
      .from('fims_inspections')
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        ),
        fims_anganwadi_forms (*),
        fims_office_inspection_forms (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('inspector_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inspections:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

export const createInspection = async (inspectionData: Partial<Inspection>): Promise<Inspection> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .insert(inspectionData)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        ),
        fims_anganwadi_forms (*),
        fims_office_inspection_forms (*),
        fims_school_inspection_forms (*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

export const updateInspection = async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        ),
        fims_anganwadi_forms (*),
        fims_office_inspection_forms (*),
        fims_school_inspection_forms (*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
};

export const deleteInspection = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // First delete related records from fims_anganwadi_forms
    const { error: anganwadiError } = await supabase
      .from('fims_anganwadi_forms')
      .delete()
      .eq('inspection_id', id);

    if (anganwadiError) {
      console.error('Error deleting anganwadi forms:', anganwadiError);
      // Continue with deletion even if this fails
    }

    // Delete related records from fims_office_inspection_forms
    const { error: officeError } = await supabase
      .from('fims_office_inspection_forms')
      .delete()
      .eq('inspection_id', id);

    if (officeError) {
      console.error('Error deleting office forms:', officeError);
      // Continue with deletion even if this fails
    }

    // Delete related records from fims_school_inspection_forms
    const { error: schoolError } = await supabase
      .from('fims_school_inspection_forms')
      .delete()
      .eq('inspection_id', id);

    if (schoolError) {
      console.error('Error deleting school forms:', schoolError);
      // Continue with deletion even if this fails
    }

    // Delete related photos (they should cascade delete, but let's be explicit)
    const { error: photosError } = await supabase
      .from('fims_inspection_photos')
      .delete()
      .eq('inspection_id', id);

    if (photosError) {
      console.error('Error deleting photos:', photosError);
      // Continue with deletion even if this fails
    }

    // Finally delete the main inspection record
    const { error } = await supabase
      .from('fims_inspections')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  // Return empty array immediately if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning empty categories list');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('fims_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

export const reassignInspection = async (id: string, newInspectorId: string): Promise<Inspection> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('fims_inspections')
      .update({
        inspector_id: newInspectorId,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        fims_categories (
          id,
          name,
          name_marathi,
          form_type
        ),
        fims_inspection_photos (
          id,
          photo_url,
          photo_name,
          description,
          photo_order
        ),
        fims_anganwadi_forms (*),
        fims_office_inspection_forms (*),
        fims_school_inspection_forms (*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error reassigning inspection:', error);
    throw error;
  }
};

export const fetchInspectors = async () => {
  // Return empty array immediately if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning empty inspectors list');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        name,
        phone_number,
        roles (
          id,
          name
        )
      `)
      .eq('roles.name', 'inspector')
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inspectors:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};