
import { Position } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const fetchPositions = async (): Promise<Position[]> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { data, error } = await supabase
      .from('positions')
      .select('*') as { data: Position[] | null, error: any };
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

export const insertPosition = async (position: Omit<Position, "id">): Promise<Position> => {
  try {
    const newPosition: Position = {
      ...position,
      id: uuidv4()
    };
    
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('positions')
      .insert(newPosition) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return newPosition;
  } catch (error) {
    console.error("Error adding position:", error);
    throw error;
  }
};

export const updatePositionData = async (position: Position): Promise<Position> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('positions')
      .update(position)
      .eq('id', position.id) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return position;
  } catch (error) {
    console.error("Error updating position:", error);
    throw error;
  }
};

export const deletePositionData = async (id: string): Promise<boolean> => {
  try {
    // Use a type assertion to bypass the TypeScript error
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id) as { error: any };
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting position:", error);
    throw error;
  }
};
