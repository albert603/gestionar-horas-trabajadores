
import React, { useState, useContext, createContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HistoryLog } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HistoryContextType {
  historyLogs: HistoryLog[];
  addHistoryLog: (action: string, description: string, performedBy?: string) => Promise<void>;
  getHistoryLogs: () => Promise<HistoryLog[]>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ 
  children: React.ReactNode;
  currentUserName?: string;
}> = ({ children, currentUserName = "System" }) => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  // Carga inicial de logs desde Supabase
  useEffect(() => {
    const fetchHistoryLogs = async () => {
      try {
        console.log("Initial fetch of history logs...");
        const { data, error } = await supabase
          .from('history_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Map de snake_case a camelCase y asegurar que siempre es un array
        const formattedLogs: HistoryLog[] = (data || []).map(log => ({
          id: log.id,
          action: log.action || '',
          description: log.description || '',
          timestamp: log.timestamp,
          performedBy: log.performed_by || 'System',
          entityType: log.entity_type || '',
          entityName: log.entity_name,
          details: log.details
        }));
        
        setHistoryLogs(formattedLogs);
        console.log("History logs initialized with", formattedLogs.length, "records");
      } catch (error) {
        console.error("Error fetching history logs:", error);
        // Asegurar que establecemos un array vacío en caso de error
        setHistoryLogs([]);
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros del historial",
          variant: "destructive"
        });
      }
    };
    
    fetchHistoryLogs();
  }, []);

  const addHistoryLog = async (action: string, description: string, performedBy: string = currentUserName) => {
    try {
      const newLog: HistoryLog = {
        id: uuidv4(),
        action,
        description,
        timestamp: new Date().toISOString(),
        performedBy,
        entityType: action.toLowerCase(),
      };
      
      // Add to local state first for immediate UI update
      setHistoryLogs(prev => [newLog, ...prev]);
      
      // Add to Supabase
      const { error } = await supabase
        .from('history_logs')
        .insert({
          id: newLog.id,
          action: newLog.action,
          description: newLog.description,
          performed_by: newLog.performedBy,
          entity_type: newLog.entityType,
          timestamp: newLog.timestamp
        });
      
      if (error) {
        console.error("Error adding history log to Supabase:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar el registro en el historial",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding history log:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro en el historial",
        variant: "destructive"
      });
    }
  };

  const getHistoryLogs = async (): Promise<HistoryLog[]> => {
    try {
      console.log("Getting history logs...");
      const { data, error } = await supabase
        .from('history_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Map de snake_case a camelCase y asegurar que siempre es un array
      const formattedLogs: HistoryLog[] = (data || []).map(log => ({
        id: log.id,
        action: log.action || '',
        description: log.description || '',
        timestamp: log.timestamp,
        performedBy: log.performed_by || 'System',
        entityType: log.entity_type || '',
        entityName: log.entity_name,
        details: log.details
      }));
      
      console.log("Retrieved", formattedLogs.length, "history logs");
      setHistoryLogs(formattedLogs);
      return formattedLogs;
    } catch (error) {
      console.error("Error fetching history logs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros del historial",
        variant: "destructive"
      });
      // Devolver el estado local actual como fallback (siempre un array)
      return historyLogs;
    }
  };

  const historyContextValue: HistoryContextType = {
    historyLogs,
    addHistoryLog,
    getHistoryLogs
  };

  return (
    <HistoryContext.Provider value={historyContextValue}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const useAddHistoryLog = () => {
  const { addHistoryLog } = useHistory();
  return addHistoryLog;
};
