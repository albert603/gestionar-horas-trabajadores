import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { EmployeeProvider, useEmployee } from './EmployeeContext';
import { SchoolProvider, useSchool } from './SchoolContext';
import { WorkEntryProvider, useWorkEntry } from './WorkEntryContext';
import { PositionProvider, usePosition } from './PositionContext';
import { RoleProvider, useRole } from './RoleContext';
import { HistoryProvider, useHistory } from '@/hooks/useHistoryLog';
import { Employee, School, WorkEntry, EditRecord, Position, Role, HistoryLog } from '@/types';

// Initial data
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Administrador",
    position: "Administrador",
    phone: "123-456-7890",
    email: "admin@example.com",
    active: true,
    username: "admin",
    password: "admin",
    role: "Administrador"
  },
  {
    id: "2",
    name: "Usuario Regular",
    position: "Profesor",
    phone: "123-456-7891",
    email: "user@example.com",
    active: true,
    username: "user",
    password: "user",
    role: "Usuario"
  }
];

const initialSchools: School[] = [
  {
    id: "1",
    name: "Escuela San José"
  },
  {
    id: "2",
    name: "Colegio Santa María"
  }
];

const initialPositions: Position[] = [
  {
    id: "1",
    name: "Profesor"
  },
  {
    id: "2",
    name: "Administrador"
  }
];

const initialRoles: Role[] = [
  {
    id: "1",
    name: "Administrador",
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
  },
  {
    id: "2",
    name: "Editor",
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false
    }
  },
  {
    id: "3",
    name: "Usuario",
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false
    }
  }
];

// Combined context interface that maintains backward compatibility
export interface AppContextType {
  employees: Employee[];
  schools: School[];
  workEntries: WorkEntry[];
  editRecords: EditRecord[];
  positions: Position[];
  roles: Role[];
  isAuthenticated: boolean;
  currentUser: Employee | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSchool: (school: Omit<School, "id">) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => boolean;
  deleteSchoolAndResetHours: (id: string) => void;
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry, editorName: string) => void;
  deleteWorkEntry: (id: string) => void;
  addPosition: (position: Omit<Position, "id">) => void;
  updatePosition: (position: Position) => void;
  deletePosition: (id: string) => void;
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
  getTotalHoursByEmployeeThisYear: (employeeId: string) => number;
  getTotalHoursBySchoolThisMonth: (schoolId: string) => number;
  getTotalHoursByEmployeeAndSchoolThisMonth: (employeeId: string, schoolId: string) => number;
  getTotalHoursForEmployeeByWeek: (employeeId: string) => number;
  getEditRecordsByWorkEntry: (workEntryId: string) => EditRecord[];
  getSchoolsByEmployee: (employeeId: string) => School[];
  getEmployeesBySchool: (schoolId: string) => Employee[];
  getTotalHoursForEmployeeByDay: (employeeId: string, date: string) => number;
  getTotalHoursBySchoolAndMonth: (schoolId: string, month: number, year: number) => {
    employee: Employee;
    hours: number;
  }[];
  getHistoryLogs: () => Promise<HistoryLog[]>;
}

// Combined context that wraps all individual contexts
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserState, setCurrentUserState] = React.useState<Employee | null>(null);

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

// Inner provider that uses Employee context
const AppProviderInner: React.FC<{ 
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

// This connects WorkEntry provider with Auth data
const WorkEntryWithAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  React.useEffect(() => {
    // This effect is needed to update the WorkEntryProvider when auth changes
    // In a real implementation, you might need to do something here
  }, [currentUser]);

  return children;
};

// This connects School provider with WorkEntry data
const SchoolWithWorkEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  React.useEffect(() => {
    // This effect is needed to update the SchoolProvider when workEntries change
    // In a real implementation, you might need to do something here
  }, [workEntries]);

  return children;
};

// This component combines all context values to provide a unified API
const CombinedContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const employee = useEmployee();
  const school = useSchool();
  const workEntry = useWorkEntry();
  const position = usePosition();
  const role = useRole();
  const history = useHistory();

  // Combine all context values into one
  const combinedContext = {
    // Auth context
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser,
    login: auth.login,
    logout: auth.logout,

    // Employee context
    employees: employee.employees,
    addEmployee: employee.addEmployee,
    updateEmployee: employee.updateEmployee,
    deleteEmployee: employee.deleteEmployee,
    getEmployeeById: employee.getEmployeeById,
    
    // School context
    schools: school.schools,
    addSchool: school.addSchool,
    updateSchool: school.updateSchool,
    deleteSchool: school.deleteSchool,
    deleteSchoolAndResetHours: school.deleteSchoolAndResetHours,
    getSchoolById: school.getSchoolById,
    getSchoolsByEmployee: school.getSchoolsByEmployee,
    getEmployeesBySchool: school.getEmployeesBySchool,
    getTotalHoursBySchoolThisMonth: school.getTotalHoursBySchoolThisMonth,
    getTotalHoursByEmployeeAndSchoolThisMonth: school.getTotalHoursByEmployeeAndSchoolThisMonth,
    getTotalHoursBySchoolAndMonth: school.getTotalHoursBySchoolAndMonth,
    
    // WorkEntry context  
    workEntries: workEntry.workEntries,
    editRecords: workEntry.editRecords,
    addWorkEntry: workEntry.addWorkEntry,
    updateWorkEntry: workEntry.updateWorkEntry,
    deleteWorkEntry: workEntry.deleteWorkEntry,
    getWorkEntriesByEmployeeAndDate: workEntry.getWorkEntriesByEmployeeAndDate,
    getEditRecordsByWorkEntry: workEntry.getEditRecordsByWorkEntry,
    getTotalHoursByEmployeeThisWeek: workEntry.getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth: workEntry.getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear: workEntry.getTotalHoursByEmployeeThisYear,
    getTotalHoursForEmployeeByDay: workEntry.getTotalHoursForEmployeeByDay,
    getTotalHoursForEmployeeByWeek: workEntry.getTotalHoursByEmployeeThisWeek,
    
    // Position context
    positions: position.positions,
    addPosition: position.addPosition,
    updatePosition: position.updatePosition,
    deletePosition: position.deletePosition,
    
    // Role context
    roles: role.roles,
    addRole: role.addRole,
    updateRole: role.updateRole,
    deleteRole: role.deleteRole,
    
    // History context
    getHistoryLogs: history.getHistoryLogs
  };

  // Create a context for the combined value
  const CombinedContext = React.createContext<AppContextType | undefined>(undefined);
  
  return (
    <CombinedContext.Provider value={combinedContext as AppContextType}>
      {children}
    </CombinedContext.Provider>
  );
};

// Export the hook to use the combined context
export const useApp = () => {
  const authContext = useAuth();
  const employeeContext = useEmployee();
  const schoolContext = useSchool();
  const workEntryContext = useWorkEntry();
  const positionContext = usePosition();
  const roleContext = useRole();
  const historyContext = useHistory();

  // Combine all hooks into one
  return {
    // Auth context
    isAuthenticated: authContext.isAuthenticated,
    currentUser: authContext.currentUser,
    login: authContext.login,
    logout: authContext.logout,

    // Employee context
    employees: employeeContext.employees,
    addEmployee: employeeContext.addEmployee,
    updateEmployee: employeeContext.updateEmployee,
    deleteEmployee: employeeContext.deleteEmployee,
    getEmployeeById: employeeContext.getEmployeeById,
    
    // School context
    schools: schoolContext.schools,
    addSchool: schoolContext.addSchool,
    updateSchool: schoolContext.updateSchool,
    deleteSchool: schoolContext.deleteSchool,
    deleteSchoolAndResetHours: schoolContext.deleteSchoolAndResetHours,
    getSchoolById: schoolContext.getSchoolById,
    getSchoolsByEmployee: schoolContext.getSchoolsByEmployee,
    getEmployeesBySchool: schoolContext.getEmployeesBySchool,
    getTotalHoursBySchoolThisMonth: schoolContext.getTotalHoursBySchoolThisMonth,
    getTotalHoursByEmployeeAndSchoolThisMonth: schoolContext.getTotalHoursByEmployeeAndSchoolThisMonth,
    getTotalHoursBySchoolAndMonth: schoolContext.getTotalHoursBySchoolAndMonth,
    
    // WorkEntry context  
    workEntries: workEntryContext.workEntries,
    editRecords: workEntryContext.editRecords,
    addWorkEntry: workEntryContext.addWorkEntry,
    updateWorkEntry: workEntryContext.updateWorkEntry,
    deleteWorkEntry: workEntryContext.deleteWorkEntry,
    getWorkEntriesByEmployeeAndDate: workEntryContext.getWorkEntriesByEmployeeAndDate,
    getEditRecordsByWorkEntry: workEntryContext.getEditRecordsByWorkEntry,
    getTotalHoursByEmployeeThisWeek: workEntryContext.getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth: workEntryContext.getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear: workEntryContext.getTotalHoursByEmployeeThisYear,
    getTotalHoursForEmployeeByDay: workEntryContext.getTotalHoursForEmployeeByDay,
    getTotalHoursForEmployeeByWeek: workEntryContext.getTotalHoursByEmployeeThisWeek,
    
    // Position context
    positions: positionContext.positions,
    addPosition: positionContext.addPosition,
    updatePosition: positionContext.updatePosition,
    deletePosition: positionContext.deletePosition,
    
    // Role context
    roles: roleContext.roles,
    addRole: roleContext.addRole,
    updateRole: roleContext.updateRole,
    deleteRole: roleContext.deleteRole,
    
    // History context
    getHistoryLogs: historyContext.getHistoryLogs
  } as unknown as AppContextType;
};
