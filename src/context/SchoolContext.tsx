
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { School, WorkEntry, Employee } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { toast } from '@/hooks/use-toast';

interface SchoolContextType {
  schools: School[];
  addSchool: (school: Omit<School, "id">) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => boolean;
  deleteSchoolAndResetHours: (id: string) => void;
  getSchoolById: (id: string) => School | undefined;
  getSchoolsByEmployee: (employeeId: string) => School[];
  getEmployeesBySchool: (schoolId: string) => Employee[];
  getTotalHoursBySchoolThisMonth: (schoolId: string) => number;
  getTotalHoursBySchoolAndMonth: (schoolId: string, month: number, year: number) => {
    employee: Employee;
    hours: number;
  }[];
  getTotalHoursByEmployeeAndSchoolThisMonth: (employeeId: string, schoolId: string) => number;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ 
  children: React.ReactNode;
  initialSchools: School[];
  workEntries: WorkEntry[];
  onDeleteWorkEntries: (schoolId: string) => void;
  employees: Employee[];
  getEmployeeById: (id: string) => Employee | undefined;
}> = ({ 
  children, 
  initialSchools, 
  workEntries, 
  onDeleteWorkEntries, 
  employees,
  getEmployeeById
}) => {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const addHistoryLog = useAddHistoryLog();

  const addSchool = (school: Omit<School, "id">) => {
    try {
      const newSchool: School = {
        ...school,
        id: uuidv4()
      };
      setSchools(prev => [...prev, newSchool]);
      addHistoryLog("Añadir", `Se añadió el colegio ${newSchool.name}`);
    } catch (error) {
      console.error("Error al añadir colegio:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el colegio. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const updateSchool = (school: School) => {
    try {
      setSchools(prev => 
        prev.map(s => s.id === school.id ? school : s)
      );
      addHistoryLog("Actualizar", `Se actualizó el colegio ${school.name}`);
    } catch (error) {
      console.error("Error al actualizar colegio:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el colegio. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const deleteSchool = (id: string): boolean => {
    try {
      const hasWorkEntries = workEntries.some(entry => entry.schoolId === id);
      if (hasWorkEntries) {
        return false;
      }
      
      const school = schools.find(s => s.id === id);
      if (school) {
        setSchools(prev => prev.filter(s => s.id !== id));
        addHistoryLog("Eliminar", `Se eliminó el colegio ${school.name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar colegio:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el colegio. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSchoolAndResetHours = (id: string): void => {
    try {
      const school = schools.find(s => s.id === id);
      
      if (school) {
        // Delete related work entries first
        onDeleteWorkEntries(id);
        
        // Then delete the school
        setSchools(prev => prev.filter(s => s.id !== id));
        
        addHistoryLog(
          "Eliminar", 
          `Se eliminó el colegio ${school.name} y todos sus registros asociados`
        );
        
        toast({
          title: "Colegio eliminado",
          description: "El colegio y todos sus registros asociados han sido eliminados.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar colegio y restablecer horas:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el colegio y sus registros.",
        variant: "destructive",
      });
    }
  };

  const getSchoolById = (id: string) => {
    return schools.find(school => school.id === id);
  };

  const getSchoolsByEmployee = (employeeId: string) => {
    const uniqueSchoolIds = [...new Set(
      workEntries
        .filter(entry => entry.employeeId === employeeId)
        .map(entry => entry.schoolId)
    )];
    
    return schools.filter(school => 
      uniqueSchoolIds.includes(school.id)
    );
  };

  const getEmployeesBySchool = (schoolId: string) => {
    const uniqueEmployeeIds = [...new Set(
      workEntries
        .filter(entry => entry.schoolId === schoolId)
        .map(entry => entry.employeeId)
    )];
    
    return employees.filter(employee => 
      uniqueEmployeeIds.includes(employee.id) || 
      (employee.assignedSchools && employee.assignedSchools.includes(schoolId))
    );
  };

  const getTotalHoursBySchoolThisMonth = (schoolId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
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

  const getTotalHoursByEmployeeAndSchoolThisMonth = (employeeId: string, schoolId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return workEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return (
          entry.employeeId === employeeId &&
          entry.schoolId === schoolId &&
          entryDate >= startOfMonth &&
          entryDate <= endOfMonth
        );
      })
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursBySchoolAndMonth = (schoolId: string, month: number, year: number) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const filteredEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entry.schoolId === schoolId &&
        entryDate >= startOfMonth &&
        entryDate <= endOfMonth
      );
    });
    
    const employeeHoursMap: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      if (!employeeHoursMap[entry.employeeId]) {
        employeeHoursMap[entry.employeeId] = 0;
      }
      employeeHoursMap[entry.employeeId] += entry.hours;
    });
    
    const result = Object.entries(employeeHoursMap).map(([employeeId, hours]) => {
      const employee = getEmployeeById(employeeId);
      if (!employee) {
        return null;
      }
      return { employee, hours };
    }).filter(Boolean) as { employee: Employee; hours: number }[];
    
    return result;
  };

  const schoolContextValue: SchoolContextType = {
    schools,
    addSchool,
    updateSchool,
    deleteSchool,
    deleteSchoolAndResetHours,
    getSchoolById,
    getSchoolsByEmployee,
    getEmployeesBySchool,
    getTotalHoursBySchoolThisMonth,
    getTotalHoursByEmployeeAndSchoolThisMonth,
    getTotalHoursBySchoolAndMonth
  };

  return (
    <SchoolContext.Provider value={schoolContextValue}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
