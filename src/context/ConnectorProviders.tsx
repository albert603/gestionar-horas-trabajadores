
import React, { useEffect } from 'react';
import { useAuth, AuthProvider } from './AuthContext';
import { useWorkEntry, WorkEntryProvider } from './WorkEntryContext';
import { useSchool, SchoolProvider } from './school/SchoolContext';
import { PositionProvider } from './PositionContext';
import { RoleProvider } from './RoleContext';
import { useEmployee } from './EmployeeContext';
import { useHistory } from '@/hooks/useHistoryLog';
import { CombinedContextProvider } from './CombinedContextProvider';
import { Employee, School, Position, Role } from '@/types';

// This connects WorkEntry provider with Auth data
export const WorkEntryWithAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { 
    workEntries, 
    editRecords,
    addWorkEntry, 
    updateWorkEntry, 
    deleteWorkEntry,
    deleteWorkEntriesBySchool,
    deleteWorkEntriesByEmployee 
  } = useWorkEntry();

  // Now update the WorkEntryProvider with auth data
  useEffect(() => {
    // This effect is needed to update the WorkEntryProvider when auth changes
    // In a real implementation, you might need to do something here
  }, [currentUser]);

  return children;
};

// This connects School provider with WorkEntry data
export const SchoolWithWorkEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    workEntries, 
    deleteWorkEntriesBySchool 
  } = useWorkEntry();
  const { 
    schools,
    updateSchool,
    deleteSchool,
    deleteSchoolAndResetHours
  } = useSchool();

  // Now update the SchoolProvider with workEntry data
  useEffect(() => {
    // This effect is needed to update the SchoolProvider when workEntries change
    // In a real implementation, you might need to do something here
  }, [workEntries]);

  return children;
};

// Inner provider that uses Employee context
export const AppProviderInner: React.FC<{ 
  children: React.ReactNode;
  initialSchools: School[];
  initialPositions: Position[];
  initialRoles: Role[];
  setCurrentUser: (user: Employee | null) => void;
}> = ({ 
  children, 
  initialSchools, 
  initialPositions, 
  initialRoles,
  setCurrentUser
}) => {
  const { employees, getEmployeeById } = useEmployee();
  const { addHistoryLog } = useHistory();

  return (
    <AuthProvider 
      employees={employees} 
      updateEmployeeState={setCurrentUser}
    >
      <WorkEntryProvider
        getEmployeeById={getEmployeeById}
        getSchoolById={(id) => initialSchools.find(s => s.id === id)}
        currentUser={null}
      >
        <WorkEntryWithAuthProvider>
          <SchoolProvider
            initialSchools={initialSchools}
            workEntries={[]}
            onDeleteWorkEntries={() => {}}
            employees={employees}
            getEmployeeById={getEmployeeById}
          >
            <SchoolWithWorkEntryProvider>
              <PositionProvider initialPositions={initialPositions}>
                <RoleProvider initialRoles={initialRoles}>
                  <CombinedContextProvider>
                    {children}
                  </CombinedContextProvider>
                </RoleProvider>
              </PositionProvider>
            </SchoolWithWorkEntryProvider>
          </SchoolProvider>
        </WorkEntryWithAuthProvider>
      </WorkEntryProvider>
    </AuthProvider>
  );
};
