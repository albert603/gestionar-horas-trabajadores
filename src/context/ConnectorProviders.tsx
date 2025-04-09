
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { useEmployee } from './EmployeeContext';
import { SchoolProvider, useSchool } from './school/SchoolContext';
import { WorkEntryProvider, useWorkEntry } from './WorkEntryContext';
import { PositionProvider, usePosition } from './PositionContext';
import { RoleProvider, useRole } from './RoleContext';
import { useHistory } from '@/hooks/useHistoryLog';
import { Employee, School, Position, Role } from '@/types';
import { CombinedContextProvider } from './CombinedContextProvider';

// Componente para conectar el contexto de WorkEntry con Auth
export const WorkEntryWithAuthProvider: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => {
  const auth = useAuth();
  const employee = useEmployee();
  const school = useSchool();
  
  return (
    <WorkEntryProvider
      currentUser={auth.currentUser}
      getEmployeeById={employee.getEmployeeById}
      getSchoolById={school.getSchoolById}
    >
      {children}
    </WorkEntryProvider>
  );
};

// Componente para conectar el contexto de School con WorkEntry
export const SchoolWithWorkEntryProvider: React.FC<{ 
  children: React.ReactNode;
  initialSchools?: School[];
}> = ({ children, initialSchools = [] }) => {
  const workEntry = useWorkEntry();
  const employee = useEmployee();
  
  return (
    <SchoolProvider
      initialSchools={initialSchools}
      workEntries={workEntry.workEntries}
      onDeleteWorkEntries={workEntry.deleteWorkEntriesBySchool}
      employees={employee.employees}
      getEmployeeById={employee.getEmployeeById}
    >
      {children}
    </SchoolProvider>
  );
};

// Componente para conectar todos los contextos
export const AppProviderInner: React.FC<{
  children: React.ReactNode;
  initialSchools?: School[];
  initialPositions?: Position[];
  initialRoles?: Role[];
  setCurrentUser: (employee: Employee) => void;
}> = ({
  children,
  initialSchools = [],
  initialPositions = [],
  initialRoles = [],
  setCurrentUser
}) => {
  return (
    <AuthProvider 
      employees={[]}
      updateEmployeeState={setCurrentUser}
    >
      <WorkEntryWithAuthProvider>
        <SchoolWithWorkEntryProvider initialSchools={initialSchools}>
          <PositionProvider initialPositions={initialPositions}>
            <RoleProvider initialRoles={initialRoles}>
              <AppProviderConnector>
                {children}
              </AppProviderConnector>
            </RoleProvider>
          </PositionProvider>
        </SchoolWithWorkEntryProvider>
      </WorkEntryWithAuthProvider>
    </AuthProvider>
  );
};

// Este componente se encarga de conectar todos los contextos con el CombinedContextProvider
const AppProviderConnector: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const auth = useAuth();
  const employee = useEmployee();
  const school = useSchool();
  const workEntry = useWorkEntry();
  const position = usePosition();
  const role = useRole();
  const history = useHistory();
  
  return (
    <CombinedContextProvider
      auth={auth}
      employee={employee}
      school={school}
      workEntry={workEntry}
      position={position}
      role={role}
      history={history}
    >
      {children}
    </CombinedContextProvider>
  );
};
