
import { useState, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HistoryLog } from '@/types';

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

  const addHistoryLog = (action: string, description: string, performedBy: string = currentUserName) => {
    try {
      const newLog: HistoryLog = {
        id: uuidv4(),
        action,
        description,
        timestamp: new Date().toISOString(),
        performedBy,
        entityType: action.toLowerCase(),
      };
      setHistoryLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error("Error adding history log:", error);
    }
  };

  const getHistoryLogs = () => {
    return historyLogs;
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
