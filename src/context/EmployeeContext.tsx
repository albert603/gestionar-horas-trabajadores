
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
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

  // Fetch employees from the database on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setEmployees(data as Employee[]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive"
        });
      }
    };
    
    fetchEmployees();
  }, []);

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const newEmployee: Employee = {
        ...employee,
        id: uuidv4(),
        active: true
      };
      
      // Insert employee into the database
      const { error } = await supabase
        .from('employees')
        .insert(newEmployee);
      
      if (error) {
        throw error;
      }
      
      // Update local state after successful database insertion
      setEmployees(prev => [...prev, newEmployee]);
      addHistoryLog("Añadir", `Se añadió el empleado ${newEmployee.name}`);
      
      toast({
        title: "Empleado añadido",
        description: `Se ha añadido a ${newEmployee.name} exitosamente`,
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el empleado",
        variant: "destructive"
      });
    }
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      // Update employee in the database
      const { error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', employee.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state after successful database update
      setEmployees(prev => 
        prev.map(e => e.id === employee.id ? employee : e)
      );
      
      if (currentUser && currentUser.id === employee.id) {
        onUpdateEmployee(employee);
      }
      
      addHistoryLog("Actualizar", `Se actualizó el empleado ${employee.name}`);
      
      toast({
        title: "Empleado actualizado",
        description: `Se ha actualizado a ${employee.name} exitosamente`,
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive"
      });
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const employee = employees.find(e => e.id === id);
      
      // Verificar si es el único administrador que queda antes de eliminarlo
      if (employee?.role === "Administrador") {
        const adminCount = employees.filter(e => e.role === "Administrador" && e.id !== id).length;
        if (adminCount < 1) {
          addHistoryLog("Error", "No se puede eliminar el último administrador", "Sistema");
          toast({
            title: "Error",
            description: "No se puede eliminar el último administrador",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Delete employee from the database
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state after successful database deletion
      setEmployees(prev => prev.filter(e => e.id !== id));
      
      addHistoryLog("Eliminar", `Se eliminó el empleado ${employee?.name || id}`);
      
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado exitosamente",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive"
      });
    }
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
