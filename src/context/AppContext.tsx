
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Employee, School, WorkEntry } from "../types";
import { generateId, initialEmployees, initialWorkEntries, schools } from "../lib/data";
import { useToast } from "@/components/ui/use-toast";

interface AppContextType {
  employees: Employee[];
  schools: School[];
  workEntries: WorkEntry[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry) => void;
  deleteWorkEntry: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initialWorkEntries);
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

  const addWorkEntry = (entry: Omit<WorkEntry, "id">) => {
    const newEntry = { ...entry, id: generateId() };
    setWorkEntries([...workEntries, newEntry]);
    toast({
      title: "Horas registradas",
      description: "Las horas de trabajo se han registrado correctamente."
    });
  };

  const updateWorkEntry = (entry: WorkEntry) => {
    setWorkEntries(workEntries.map(e => (e.id === entry.id ? entry : e)));
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

  const contextValue: AppContextType = {
    employees,
    schools,
    workEntries,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    getEmployeeById,
    getSchoolById,
    getWorkEntriesByEmployeeAndDate,
    getTotalHoursByEmployeeThisWeek,
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
