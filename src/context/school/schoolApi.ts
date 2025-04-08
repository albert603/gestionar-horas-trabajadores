
import { School } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const fetchSchools = async (): Promise<School[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data as School[];
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw error;
  }
};

export const insertSchool = async (school: Omit<School, "id">): Promise<School> => {
  try {
    const newSchool: School = {
      ...school,
      id: uuidv4()
    };
    
    const { error } = await supabase
      .from('schools')
      .insert(newSchool);
    
    if (error) {
      throw error;
    }
    
    return newSchool;
  } catch (error) {
    console.error("Error adding school:", error);
    throw error;
  }
};

export const updateSchoolData = async (school: School): Promise<School> => {
  try {
    const { error } = await supabase
      .from('schools')
      .update(school)
      .eq('id', school.id);
    
    if (error) {
      throw error;
    }
    
    return school;
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
};

export const deleteSchoolData = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting school:", error);
    throw error;
  }
};

export const deleteWorkEntriesBySchool = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_entries')
      .delete()
      .eq('school_id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting work entries by school:", error);
    throw error;
  }
};
