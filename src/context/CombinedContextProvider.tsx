
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useEmployee } from './EmployeeContext';
import { useSchool } from './school/SchoolContext';
import { useWorkEntry } from './WorkEntryContext';
import { usePosition } from './PositionContext';
import { useRole } from './RoleContext';
import { useHistory } from '@/hooks/useHistoryLog';
import { AppContextType } from './AppContextType';

// Creamos un contexto combinado para proporcionar una API unificada
export const CombinedContext = createContext<AppContextType | undefined>(undefined);

// Este componente combina todos los valores de contexto
export const CombinedContextProvider: React.FC<{ 
  children: React.ReactNode;
  auth: ReturnType<typeof useAuth>;
  employee: ReturnType<typeof useEmployee>;
  school: ReturnType<typeof useSchool>;
  workEntry: ReturnType<typeof useWorkEntry>;
  position: ReturnType<typeof usePosition>;
  role: ReturnType<typeof useRole>;
  history: ReturnType<typeof useHistory>;
}> = ({ 
  children, 
  auth,
  employee,
  school,
  workEntry,
  position,
  role,
  history
}) => {
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
  
  return (
    <CombinedContext.Provider value={combinedContext}>
      {children}
    </CombinedContext.Provider>
  );
};

// Hook para usar el contexto combinado
export const useCombinedContext = () => {
  const context = useContext(CombinedContext);
  if (context === undefined) {
    throw new Error('useCombinedContext debe usarse dentro de un CombinedContextProvider');
  }
  return context;
};
