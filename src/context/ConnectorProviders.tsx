
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
  // Pasamos los empleados desde el provider de nivel superior
  const { employees } = useEmployee();
  
  return (
    <AuthProvider 
      employees={employees}
      updateEmployeeState={setCurrentUser}
    >
      <AppProviderStructure 
        initialSchools={initialSchools}
        initialPositions={initialPositions}
        initialRoles={initialRoles}
      >
        {children}
      </AppProviderStructure>
    </AuthProvider>
  );
};

// Componente intermedio para proporcionar la estructura correcta de proveedores
const AppProviderStructure: React.FC<{
  children: React.ReactNode;
  initialSchools: School[];
  initialPositions: Position[];
  initialRoles: Role[];
}> = ({
  children,
  initialSchools,
  initialPositions,
  initialRoles
}) => {
  const { currentUser } = useAuth();
  const { employees, getEmployeeById } = useEmployee();
  
  return (
    <SchoolProvider
      initialSchools={initialSchools}
      workEntries={[]}
      onDeleteWorkEntries={() => {}}
      employees={employees}
      getEmployeeById={getEmployeeById}
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
      {children}
    </WorkEntryProvider>
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
