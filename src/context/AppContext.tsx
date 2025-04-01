import React, { createContext, useContext, useState, ReactNode } from "react";
import { Employee, School, WorkEntry, EditRecord } from "../types";
import { generateId, initialEmployees, initialWorkEntries, initialSchools } from "../lib/data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface AppContextType {
  employees: Employee[];
  schools: School[];
  workEntries: WorkEntry[];
  editRecords: EditRecord[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSchool: (school: Omit<School, "id">) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => void;
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry, editorName: string) => void;
  deleteWorkEntry: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
  getTotalHoursByEmployeeThisYear: (employeeId: string) => number;
  getTotalHoursBySchoolThisMonth: (schoolId: string) => number;
  getEditRecordsByWorkEntry: (workEntryId: string) => EditRecord[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initialWorkEntries);
  const [editRecords, setEditRecords] = useState<EditRecord[]>([]);
  const { toast } = useToast();

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = { ...employee, id: generateId() };
    setEmployees([...employees, newEmployee]);
    toast({
      title: "Empleado agregado",
      description: `${newEmployee.name} ha sido agregado correctamente.`
    });
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(employees.map(e => (e.id === employee.id ? employee : e)));
    toast({
      title: "Empleado actualizado",
      description: `${employee.name} ha sido actualizado correctamente.`
    });
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(employees.filter(e => e.id !== id));
    
    // Also delete all work entries for this employee
    setWorkEntries(workEntries.filter(entry => entry.employeeId !== id));
    
    toast({
      title: "Empleado eliminado",
      description: employee ? `${employee.name} ha sido eliminado correctamente.` : "Empleado eliminado correctamente"
    });
  };

  const addSchool = (school: Omit<School, "id">) => {
    const newSchool = { ...school, id: generateId() };
    setSchools([...schools, newSchool]);
    toast({
      title: "Colegio agregado",
      description: `${newSchool.name} ha sido agregado correctamente.`
    });
  };

  const updateSchool = (school: School) => {
    setSchools(schools.map(s => (s.id === school.id ? school : s)));
    toast({
      title: "Colegio actualizado",
      description: `${school.name} ha sido actualizado correctamente.`
    });
  };

  const deleteSchool = (id: string) => {
    const school = schools.find(s => s.id === id);
    
    // Check if the school is being used in any work entry
    const isSchoolInUse = workEntries.some(entry => entry.schoolId === id);
    
    if (isSchoolInUse) {
      toast({
        title: "Error al eliminar",
        description: "Este colegio no puede ser eliminado porque tiene registros de horas asociados.",
        variant: "destructive"
      });
      return;
    }
    
    setSchools(schools.filter(s => s.id !== id));
    toast({
      title: "Colegio eliminado",
      description: school ? `${school.name} ha sido eliminado correctamente.` : "Colegio eliminado correctamente"
    });
  };

  const addWorkEntry = (entry: Omit<WorkEntry, "id">) => {
    const now = new Date();
    const newEntry = { 
      ...entry, 
      id: generateId(),
      lastEditedBy: "Usuario",
      lastEditedAt: now.toISOString()
    };
    setWorkEntries([...workEntries, newEntry]);
    toast({
      title: "Horas registradas",
      description: "Las horas de trabajo se han registrado correctamente."
    });
  };

  const updateWorkEntry = (entry: WorkEntry, editorName: string) => {
    // Find the original entry to compare
    const originalEntry = workEntries.find(e => e.id === entry.id);
    
    if (originalEntry && originalEntry.hours !== entry.hours) {
      // Create an edit record
      const now = new Date();
      const editRecord: EditRecord = {
        id: generateId(),
        workEntryId: entry.id,
        editedBy: editorName,
        editedAt: now.toISOString(),
        previousHours: originalEntry.hours,
        newHours: entry.hours
      };
      
      setEditRecords([...editRecords, editRecord]);
      
      // Update the entry with edit information
      const updatedEntry = {
        ...entry,
        lastEditedBy: editorName,
        lastEditedAt: now.toISOString()
      };
      
      setWorkEntries(workEntries.map(e => (e.id === entry.id ? updatedEntry : e)));
    } else {
      // If hours didn't change, just update other fields
      setWorkEntries(workEntries.map(e => (e.id === entry.id ? entry : e)));
    }
    
    toast({
      title: "Registro actualizado",
      description: "Las horas de trabajo se han actualizado correctamente."
    });
  };

  const deleteWorkEntry = (id: string) => {
    setWorkEntries(workEntries.filter(e => e.id !== id));
    toast({
      title: "Registro eliminado",
      description: "Las horas de trabajo se han eliminado correctamente."
    });
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  const getSchoolById = (id: string) => {
    return schools.find(s => s.id === id);
  };

  const getWorkEntriesByEmployeeAndDate = (employeeId: string, date: string) => {
    return workEntries.filter(entry => entry.employeeId === employeeId && entry.date === date);
  };

  const getTotalHoursByEmployeeThisWeek = (employeeId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
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

  // New functions for reports
  const getTotalHoursByEmployeeThisMonth = (employeeId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
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
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
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
  
  const getTotalHoursBySchoolThisMonth = (schoolId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return workEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entry.schoolId === schoolId &&
          entryDate >= startOfMonth &&
          entryDate <= endOfMonth
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };
  
  const getEditRecordsByWorkEntry = (workEntryId: string) => {
    return editRecords.filter(record => record.workEntryId === workEntryId);
  };

  const contextValue: AppContextType = {
    employees,
    schools,
    workEntries,
    editRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSchool,
    updateSchool,
    deleteSchool,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    getEmployeeById,
    getSchoolById,
    getWorkEntriesByEmployeeAndDate,
    getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear,
    getTotalHoursBySchoolThisMonth,
    getEditRecordsByWorkEntry,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe ser usado dentro de un AppProvider");
  }
  return context;
};
