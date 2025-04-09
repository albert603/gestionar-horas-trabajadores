
import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import { EmployeeProvider, useEmployee } from './EmployeeContext';
import { SchoolProvider } from './school/SchoolContext';
import { WorkEntryProvider } from './WorkEntryContext';
import { PositionProvider } from './PositionContext';
import { RoleProvider } from './RoleContext';
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

  const updateCurrentUser = (employee: Employee) => {
    setCurrentUserState(employee);
  };

  return (
    <HistoryProvider currentUserName={currentUserState?.name}>
      <EmployeeProvider 
        initialEmployees={initialEmployees}
        onUpdateEmployee={updateCurrentUser}
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
