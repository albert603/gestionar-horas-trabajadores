import React, { createContext, useContext, useState, ReactNode } from "react";
import { Employee, School, WorkEntry, EditRecord, Position } from "../types";
import { generateId, initialEmployees, initialWorkEntries, initialSchools } from "../lib/data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface AppContextType {
  employees: Employee[];
  schools: School[];
  workEntries: WorkEntry[];
  editRecords: EditRecord[];
  positions: Position[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSchool: (school: Omit<School, "id">) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => void;
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry, editorName: string) => void;
  deleteWorkEntry: (id: string) => void;
  addPosition: (position: Omit<Position, "id">) => void;
  updatePosition: (position: Position) => void;
  deletePosition: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
  getTotalHoursByEmployeeThisYear: (employeeId: string) => number;
  getTotalHoursBySchoolThisMonth: (schoolId: string) => number;
  getTotalHoursByEmployeeAndSchoolThisMonth: (employeeId: string, schoolId: string) => number;
  getEditRecordsByWorkEntry: (workEntryId: string) => EditRecord[];
  getSchoolsByEmployee: (employeeId: string) => School[];
  getEmployeesBySchool: (schoolId: string) => Employee[];
  getTotalHoursForEmployeeByDay: (employeeId: string, date: string) => number;
  getTotalHoursBySchoolAndMonth: (schoolId: string, month: number, year: number) => {
    employee: Employee;
    hours: number;
  }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initialWorkEntries);
  const [editRecords, setEditRecords] = useState<EditRecord[]>([]);
  const [positions, setPositions] = useState<Position[]>([
    { id: "pos-1", name: "Profesor" },
    { id: "pos-2", name: "Administrativo" },
    { id: "pos-3", name: "Auxiliar" }
  ]);
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
      const updatedEntry = {
        ...entry,
        lastEditedBy: editorName,
        lastEditedAt: new Date().toISOString()
      };
      setWorkEntries(workEntries.map(e => (e.id === entry.id ? updatedEntry : e)));
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

  const addPosition = (position: Omit<Position, "id">) => {
    const newPosition = { ...position, id: generateId() };
    setPositions([...positions, newPosition]);
    toast({
      title: "Cargo agregado",
      description: `${newPosition.name} ha sido agregado correctamente.`
    });
  };

  const updatePosition = (position: Position) => {
    setPositions(positions.map(p => (p.id === position.id ? position : p)));
    toast({
      title: "Cargo actualizado",
      description: `${position.name} ha sido actualizado correctamente.`
    });
  };

  const deletePosition = (id: string) => {
    // Check if the position is being used by any employee
    const isPositionInUse = employees.some(e => e.position === positions.find(p => p.id === id)?.name);
    
    if (isPositionInUse) {
      toast({
        title: "Error al eliminar",
        description: "Este cargo no puede ser eliminado porque está siendo utilizado por empleados.",
        variant: "destructive"
      });
      return;
    }
    
    const position = positions.find(p => p.id === id);
    setPositions(positions.filter(p => p.id !== id));
    
    toast({
      title: "Cargo eliminado",
      description: position ? `${position.name} ha sido eliminado correctamente.` : "Cargo eliminado correctamente"
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
  
  const getTotalHoursForEmployeeByDay = (employeeId: string, date: string) => {
    return workEntries
      .filter(entry => entry.employeeId === employeeId && entry.date === date)
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalHoursByEmployeeAndSchoolThisMonth = (employeeId: string, schoolId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
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
    const endOfMonth = new Date(year, month + 1, 0);
    
    // Get all entries for this school in the specified month
    const schoolEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entry.schoolId === schoolId &&
        entryDate >= startOfMonth &&
        entryDate <= endOfMonth
      );
    });
    
    // Group by employee and sum hours
    const employeeHoursMap = new Map<string, number>();
    
    schoolEntries.forEach(entry => {
      const currentHours = employeeHoursMap.get(entry.employeeId) || 0;
      employeeHoursMap.set(entry.employeeId, currentHours + entry.hours);
    });
    
    // Convert to array of employee objects with hours
    const result = Array.from(employeeHoursMap.entries()).map(([employeeId, hours]) => {
      const employee = employees.find(e => e.id === employeeId);
      return {
        employee: employee!,
        hours
      };
    }).filter(item => item.employee); // Filter out any undefined employees
    
    return result;
  };

  const getEditRecordsByWorkEntry = (workEntryId: string) => {
    return editRecords.filter(record => record.workEntryId === workEntryId);
  };

  const getSchoolsByEmployee = (employeeId: string) => {
    const schoolIds = [...new Set(
      workEntries
        .filter(entry => entry.employeeId === employeeId)
        .map(entry => entry.schoolId)
    )];
    
    return schools.filter(school => schoolIds.includes(school.id));
  };

  const getEmployeesBySchool = (schoolId: string) => {
    const employeeIds = [...new Set(
      workEntries
        .filter(entry => entry.schoolId === schoolId)
        .map(entry => entry.employeeId)
    )];
    
    return employees.filter(employee => employeeIds.includes(employee.id));
  };

  const contextValue: AppContextType = {
    employees,
    schools,
    workEntries,
    editRecords,
    positions,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSchool,
    updateSchool,
    deleteSchool,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    addPosition,
    updatePosition,
    deletePosition,
    getEmployeeById,
    getSchoolById,
    getWorkEntriesByEmployeeAndDate,
    getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear,
    getTotalHoursBySchoolThisMonth,
    getTotalHoursByEmployeeAndSchoolThisMonth,
    getEditRecordsByWorkEntry,
    getSchoolsByEmployee,
    getEmployeesBySchool,
    getTotalHoursForEmployeeByDay,
    getTotalHoursBySchoolAndMonth
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
