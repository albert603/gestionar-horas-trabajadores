
import { useState, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HistoryLog } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface HistoryContextType {
  historyLogs: HistoryLog[];
  addHistoryLog: (action: string, description: string, performedBy?: string) => void;
  getHistoryLogs: () => HistoryLog[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ 
  children: React.ReactNode;
  currentUserName?: string;
}> = ({ children, currentUserName = "System" }) => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  // Carga inicial de logs desde Supabase
  React.useEffect(() => {
    const fetchHistoryLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('history_logs')
          .select('*')
          .order('timestamp', { ascending: false }) as { data: any[], error: any };
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedLogs: HistoryLog[] = data.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description,
            timestamp: log.timestamp,
            performedBy: log.performed_by,
            entityType: log.entity_type,
            entityName: log.entity_name,
            details: log.details
          }));
          
          setHistoryLogs(formattedLogs);
        }
      } catch (error) {
        console.error("Error fetching history logs:", error);
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
      
      // Add to local state
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
      }
    } catch (error) {
      console.error("Error adding history log:", error);
    }
  };

  const getHistoryLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('history_logs')
        .select('*')
        .order('timestamp', { ascending: false }) as { data: any[], error: any };
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedLogs: HistoryLog[] = data.map(log => ({
          id: log.id,
          action: log.action,
          description: log.description,
          timestamp: log.timestamp,
          performedBy: log.performed_by,
          entityType: log.entity_type,
          entityName: log.entity_name,
          details: log.details
        }));
        
        return formattedLogs;
      }
    } catch (error) {
      console.error("Error fetching history logs:", error);
    }
    
    return historyLogs; // Fallback to local state if Supabase query fails
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
