
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
      <SchoolProvider
        initialSchools={initialSchools}
        workEntries={[]}
        onDeleteWorkEntries={(schoolId: string) => {}}
        employees={[]}
        getEmployeeById={(id: string) => undefined}
      >
        <WorkEntryConnector>
          <PositionProvider initialPositions={initialPositions}>
            <RoleProvider initialRoles={initialRoles}>
              <AppProviderConnector>
                {children}
              </AppProviderConnector>
            </RoleProvider>
          </PositionProvider>
        </WorkEntryConnector>
      </SchoolProvider>
    </AuthProvider>
  );
};

// Componente para conectar el contexto de WorkEntry con Auth y School
const WorkEntryConnector: React.FC<{ 
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
      <SchoolWorkEntryUpdater>
        {children}
      </SchoolWorkEntryUpdater>
    </WorkEntryProvider>
  );
};

// Componente para actualizar SchoolProvider con WorkEntry data
const SchoolWorkEntryUpdater: React.FC<{ 
  children: React.ReactNode
}> = ({ children }) => {
  const workEntry = useWorkEntry();
  const employee = useEmployee();
  const school = useSchool();
  
  // Update SchoolProvider with actual data from WorkEntry
  React.useEffect(() => {
    // This effect can be used to sync data between contexts if needed
  }, [workEntry.workEntries]);
  
  return <>{children}</>;
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
