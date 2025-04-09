
import { Role } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { data, error } = await supabase
      .from('roles')
      .select('*') as { data: Role[] | null, error: any };
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const insertRole = async (role: Omit<Role, "id">): Promise<Role> => {
  try {
    const newRole: Role = {
      ...role,
      id: uuidv4()
    };
    
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('roles')
      .insert(newRole) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return newRole;
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};

export const updateRoleData = async (role: Role): Promise<Role> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('roles')
      .update(role)
      .eq('id', role.id) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return role;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const deleteRoleData = async (id: string): Promise<boolean> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};
