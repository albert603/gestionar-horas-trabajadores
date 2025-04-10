
import React, { useState } from 'react';
import { EmployeeProvider } from './EmployeeContext';
import { HistoryProvider } from '@/hooks/useHistoryLog';
import { Employee } from '@/types';
import { initialEmployees, initialSchools, initialPositions, initialRoles } from './initialData';
import { AppProviderInner } from './ConnectorProviders';

// Export the AppContextType and useApp hook
export type { AppContextType } from './AppContextType';
export { useApp } from './useApp';

// Combined context that wraps all individual contexts
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserState, setCurrentUserState] = useState<Employee | null>(null);

  console.log("AppProvider - Inicializando el provider principal");

  return (
    <HistoryProvider currentUserName={currentUserState?.name}>
      <EmployeeProvider 
        initialEmployees={initialEmployees}
        onUpdateEmployee={setCurrentUserState}
        currentUser={currentUserState}
      >
        <AppProviderInner 
          initialSchools={initialSchools}
          initialPositions={initialPositions}
          initialRoles={initialRoles}
          setCurrentUser={setCurrentUserState}
        >
          {children}
        </AppProviderInner>
      </EmployeeProvider>
    </HistoryProvider>
  );
};
