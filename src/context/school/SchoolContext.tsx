
import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, WorkEntry, Employee } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { toast } from '@/components/ui/use-toast';
import { SchoolContextType, SchoolProviderProps } from './types';
import { 
  getSchoolById,
  getSchoolsByEmployee,
  getEmployeesBySchool,
  getTotalHoursBySchoolThisMonth,
  getTotalHoursByEmployeeAndSchoolThisMonth,
  getTotalHoursBySchoolAndMonth
} from './schoolUtils';
import {
  fetchSchools,
  insertSchool,
  updateSchoolData,
  deleteSchoolData,
  deleteWorkEntriesBySchool
} from './schoolApi';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ 
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
    const loadSchools = async () => {
      try {
        const data = await fetchSchools();
        setSchools(data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los colegios",
          variant: "destructive"
        });
      }
    };
    
    loadSchools();
  }, []);

  const addSchool = async (school: Omit<School, "id">) => {
    try {
      const newSchool = await insertSchool(school);
      
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
      await updateSchoolData(school);
      
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
        const success = await deleteSchoolData(id);
        
        if (success) {
          setSchools(prev => prev.filter(s => s.id !== id));
          addHistoryLog("Eliminar", `Se eliminó el colegio ${school.name}`);
          
          toast({
            title: "Colegio eliminado",
            description: `Se ha eliminado el colegio ${school.name} exitosamente`,
          });
        }
        
        return success;
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
        await deleteWorkEntriesBySchool(id);
        await deleteSchoolData(id);
        
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

  const schoolContextValue: SchoolContextType = {
    schools,
    addSchool,
    updateSchool,
    deleteSchool,
    deleteSchoolAndResetHours,
    getSchoolById: (id) => getSchoolById(schools, id),
    getSchoolsByEmployee: (employeeId) => getSchoolsByEmployee(workEntries, schools, employeeId),
    getEmployeesBySchool: (schoolId) => getEmployeesBySchool(workEntries, employees, schoolId),
    getTotalHoursBySchoolThisMonth: (schoolId) => getTotalHoursBySchoolThisMonth(workEntries, schoolId),
    getTotalHoursByEmployeeAndSchoolThisMonth: (employeeId, schoolId) => 
      getTotalHoursByEmployeeAndSchoolThisMonth(workEntries, employeeId, schoolId),
    getTotalHoursBySchoolAndMonth: (schoolId, month, year) => 
      getTotalHoursBySchoolAndMonth(workEntries, schoolId, month, year, getEmployeeById)
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
