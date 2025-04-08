import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { School, WorkEntry, Employee } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SchoolContextType {
  schools: School[];
  addSchool: (school: Omit<School, "id">) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (id: string) => Promise<boolean>;
  deleteSchoolAndResetHours: (id: string) => Promise<void>;
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

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setSchools(data as School[]);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los colegios",
          variant: "destructive"
        });
      }
    };
    
    fetchSchools();
  }, []);

  const addSchool = async (school: Omit<School, "id">) => {
    try {
      const newSchool: School = {
        ...school,
        id: uuidv4()
      };
      
      const { error } = await supabase
        .from('schools')
        .insert(newSchool);
      
      if (error) {
        throw error;
      }
      
      setSchools(prev => [...prev, newSchool]);
      addHistoryLog("Añadir", `Se añadió el colegio ${newSchool.name}`);
      
      toast({
        title: "Colegio añadido",
        description: `Se ha añadido el colegio ${newSchool.name} exitosamente`,
      });
    } catch (error) {
      console.error("Error al añadir colegio:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el colegio. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const updateSchool = async (school: School) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update(school)
        .eq('id', school.id);
      
      if (error) {
        throw error;
      }
      
      setSchools(prev => 
        prev.map(s => s.id === school.id ? school : s)
      );
      
      addHistoryLog("Actualizar", `Se actualizó el colegio ${school.name}`);
      
      toast({
        title: "Colegio actualizado",
        description: `Se ha actualizado el colegio ${school.name} exitosamente`,
      });
    } catch (error) {
      console.error("Error al actualizar colegio:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el colegio. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const deleteSchool = async (id: string): Promise<boolean> => {
    try {
      const hasWorkEntries = workEntries.some(entry => entry.schoolId === id);
      if (hasWorkEntries) {
        return false;
      }
      
      const school = schools.find(s => s.id === id);
      if (school) {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        setSchools(prev => prev.filter(s => s.id !== id));
        addHistoryLog("Eliminar", `Se eliminó el colegio ${school.name}`);
        
        toast({
          title: "Colegio eliminado",
          description: `Se ha eliminado el colegio ${school.name} exitosamente`,
        });
        
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

  const deleteSchoolAndResetHours = async (id: string): Promise<void> => {
    try {
      const school = schools.find(s => s.id === id);
      
      if (school) {
        await supabase
          .from('work_entries')
          .delete()
          .eq('school_id', id);
        
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        onDeleteWorkEntries(id);
        
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
