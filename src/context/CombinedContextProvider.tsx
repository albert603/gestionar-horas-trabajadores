
import React, { createContext } from 'react';
import { useAuth } from './AuthContext';
import { useEmployee } from './EmployeeContext';
import { useSchool } from './school/SchoolContext';
import { useWorkEntry } from './WorkEntryContext';
import { usePosition } from './PositionContext';
import { useRole } from './RoleContext';
import { useHistory } from '@/hooks/useHistoryLog';
import { AppContextType } from './AppContextType';

// This component combines all context values to provide a unified API
export const CombinedContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const employee = useEmployee();
  const school = useSchool();
  const workEntry = useWorkEntry();
  const position = usePosition();
  const role = useRole();
  const history = useHistory();

  // Combine all context values into one
  const combinedContext: AppContextType = {
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
  const CombinedContext = createContext<AppContextType | undefined>(undefined);
  
  return (
    <CombinedContext.Provider value={combinedContext}>
      {children}
    </CombinedContext.Provider>
  );
};
