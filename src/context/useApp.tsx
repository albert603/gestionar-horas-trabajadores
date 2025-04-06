
import { useAuth } from './AuthContext';
import { useEmployee } from './EmployeeContext';
import { useSchool } from './SchoolContext';
import { useWorkEntry } from './WorkEntryContext';
import { usePosition } from './PositionContext';
import { useRole } from './RoleContext';
import { useHistory } from '@/hooks/useHistoryLog';
import { AppContextType } from './AppContextType';

// Export the hook to use the combined context
export const useApp = (): AppContextType => {
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
  };
};
