
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ 
  children: React.ReactNode;
  initialEmployees: Employee[];
  onUpdateEmployee: (employee: Employee) => void;
  currentUser: Employee | null;
}> = ({ children, initialEmployees, onUpdateEmployee, currentUser }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const addHistoryLog = useAddHistoryLog();

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employee,
      id: uuidv4(),
      active: true
    };
    setEmployees(prev => [...prev, newEmployee]);
    addHistoryLog("Añadir", `Se añadió el empleado ${newEmployee.name}`);
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(prev => 
      prev.map(e => e.id === employee.id ? employee : e)
    );
    
    if (currentUser && currentUser.id === employee.id) {
      onUpdateEmployee(employee);
    }
    
    addHistoryLog("Actualizar", `Se actualizó el empleado ${employee.name}`);
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    
    // Verificar si es el único administrador que queda antes de eliminarlo
    if (employee?.role === "Administrador") {
      const adminCount = employees.filter(e => e.role === "Administrador" && e.id !== id).length;
      if (adminCount < 1) {
        addHistoryLog("Error", "No se puede eliminar el último administrador", "Sistema");
        return;
      }
    }
    
    // Eliminar el empleado completamente en lugar de marcarlo como inactivo
    setEmployees(prev => prev.filter(e => e.id !== id));
    
    addHistoryLog("Eliminar", `Se eliminó el empleado ${employee?.name || id}`);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(employee => employee.id === id);
  };

  const employeeContextValue: EmployeeContextType = {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById
  };

  return (
    <EmployeeContext.Provider value={employeeContextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};
