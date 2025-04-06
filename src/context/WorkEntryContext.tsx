
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WorkEntry, EditRecord, Employee, School } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';

interface WorkEntryContextType {
  workEntries: WorkEntry[];
  editRecords: EditRecord[];
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry, editorName: string) => void;
  deleteWorkEntry: (id: string) => void;
  deleteWorkEntriesBySchool: (schoolId: string) => void;
  deleteWorkEntriesByEmployee: (employeeId: string) => void;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getEditRecordsByWorkEntry: (workEntryId: string) => EditRecord[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
  getTotalHoursByEmployeeThisYear: (employeeId: string) => number;
  getTotalHoursForEmployeeByDay: (employeeId: string, date: string) => number;
}

const WorkEntryContext = createContext<WorkEntryContextType | undefined>(undefined);

export const WorkEntryProvider: React.FC<{ 
  children: React.ReactNode;
  initialWorkEntries?: WorkEntry[];
  initialEditRecords?: EditRecord[];
  currentUser: Employee | null;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
}> = ({ 
  children, 
  initialWorkEntries = [], 
  initialEditRecords = [],
  currentUser,
  getEmployeeById,
  getSchoolById
}) => {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initialWorkEntries);
  const [editRecords, setEditRecords] = useState<EditRecord[]>(initialEditRecords);
  const addHistoryLog = useAddHistoryLog();

  const addWorkEntry = (entry: Omit<WorkEntry, "id">) => {
    const newEntry: WorkEntry = {
      ...entry,
      id: uuidv4(),
      lastEditedBy: currentUser?.name || "Sistema",
      lastEditedAt: new Date().toISOString()
    };
    setWorkEntries(prev => [...prev, newEntry]);
    
    const employee = getEmployeeById(newEntry.employeeId);
    const school = getSchoolById(newEntry.schoolId);
    
    addHistoryLog(
      "Añadir", 
      `Se registraron ${newEntry.hours} horas para ${employee?.name || "empleado"} en ${school?.name || "colegio"}`
    );
  };

  const updateWorkEntry = (entry: WorkEntry, editorName: string) => {
    const oldEntry = workEntries.find(e => e.id === entry.id);
    if (oldEntry && oldEntry.hours !== entry.hours) {
      const newEditRecord: EditRecord = {
        id: uuidv4(),
        workEntryId: entry.id,
        editedBy: editorName || currentUser?.name || "Sistema",
        editedAt: new Date().toISOString(),
        previousHours: oldEntry.hours,
        newHours: entry.hours
      };
      setEditRecords(prev => [...prev, newEditRecord]);
    }
    
    const updatedEntry = {
      ...entry,
      lastEditedBy: editorName || currentUser?.name || "Sistema",
      lastEditedAt: new Date().toISOString()
    };
    
    setWorkEntries(prev => 
      prev.map(e => e.id === entry.id ? updatedEntry : e)
    );
    
    const employee = getEmployeeById(entry.employeeId);
    const school = getSchoolById(entry.schoolId);
    
    addHistoryLog(
      "Actualizar", 
      `Se actualizaron las horas de ${employee?.name || "empleado"} en ${school?.name || "colegio"} a ${entry.hours}h`
    );
  };

  const deleteWorkEntry = (id: string) => {
    const entry = workEntries.find(e => e.id === id);
    
    setEditRecords(prev => prev.filter(record => record.workEntryId !== id));
    
    setWorkEntries(prev => prev.filter(e => e.id !== id));
    
    const employee = entry ? getEmployeeById(entry.employeeId) : null;
    const school = entry ? getSchoolById(entry.schoolId) : null;
    
    addHistoryLog(
      "Eliminar", 
      `Se eliminó el registro de horas de ${employee?.name || "empleado"} en ${school?.name || "colegio"}`
    );
  };

  const deleteWorkEntriesBySchool = (schoolId: string) => {
    const entriesOfSchool = workEntries.filter(entry => entry.schoolId === schoolId);
    const entryIds = entriesOfSchool.map(entry => entry.id);
    
    setEditRecords(prev => 
      prev.filter(record => !entryIds.includes(record.workEntryId))
    );
    
    setWorkEntries(prev => prev.filter(entry => entry.schoolId !== schoolId));
  };

  const deleteWorkEntriesByEmployee = (employeeId: string) => {
    const entriesOfEmployee = workEntries.filter(entry => entry.employeeId === employeeId);
    const entryIds = entriesOfEmployee.map(entry => entry.id);
    
    setEditRecords(prev => 
      prev.filter(record => !entryIds.includes(record.workEntryId))
    );
    
    setWorkEntries(prev => prev.filter(entry => entry.employeeId !== employeeId));
  };

  const getWorkEntriesByEmployeeAndDate = (employeeId: string, date: string) => {
    return workEntries.filter(
      entry => entry.employeeId === employeeId && entry.date === date
    );
  };

  const getEditRecordsByWorkEntry = (workEntryId: string) => {
    return editRecords.filter(record => record.workEntryId === workEntryId);
  };

  const getTotalHoursByEmployeeThisWeek = (employeeId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    return workEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entry.employeeId === employeeId &&
          entryDate >= startOfWeek &&
          entryDate <= endOfWeek
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursByEmployeeThisMonth = (employeeId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return workEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entry.employeeId === employeeId &&
          entryDate >= startOfMonth &&
          entryDate <= endOfMonth
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursByEmployeeThisYear = (employeeId: string) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    return workEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entry.employeeId === employeeId &&
          entryDate >= startOfYear &&
          entryDate <= endOfYear
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursForEmployeeByDay = (employeeId: string, date: string) => {
    return workEntries
      .filter(entry => 
        entry.employeeId === employeeId && 
        entry.date === date
      )
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const workEntryContextValue: WorkEntryContextType = {
    workEntries,
    editRecords,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    deleteWorkEntriesBySchool,
    deleteWorkEntriesByEmployee,
    getWorkEntriesByEmployeeAndDate,
    getEditRecordsByWorkEntry,
    getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear,
    getTotalHoursForEmployeeByDay
  };

  return (
    <WorkEntryContext.Provider value={workEntryContextValue}>
      {children}
    </WorkEntryContext.Provider>
  );
};

export const useWorkEntry = () => {
  const context = useContext(WorkEntryContext);
  if (context === undefined) {
    throw new Error('useWorkEntry must be used within a WorkEntryProvider');
  }
  return context;
};
