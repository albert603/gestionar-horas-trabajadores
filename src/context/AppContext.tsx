import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Employee, School, WorkEntry, EditRecord, Position, Role } from "../types";
import { generateId, initialEmployees, initialWorkEntries, initialSchools } from "../lib/data";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface AppContextType {
  employees: Employee[];
  schools: School[];
  workEntries: WorkEntry[];
  editRecords: EditRecord[];
  positions: Position[];
  roles: Role[];
  isAuthenticated: boolean;
  currentUser: Employee | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSchool: (school: Omit<School, "id">) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (id: string) => void;
  deleteSchoolAndResetHours: (id: string) => void;
  addWorkEntry: (entry: Omit<WorkEntry, "id">) => void;
  updateWorkEntry: (entry: WorkEntry, editorName: string) => void;
  deleteWorkEntry: (id: string) => void;
  addPosition: (position: Omit<Position, "id">) => void;
  updatePosition: (position: Position) => void;
  deletePosition: (id: string) => void;
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getSchoolById: (id: string) => School | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisWeek: (employeeId: string) => number;
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
  getTotalHoursByEmployeeThisYear: (employeeId: string) => number;
  getTotalHoursBySchoolThisMonth: (schoolId: string) => number;
  getTotalHoursByEmployeeAndSchoolThisMonth: (employeeId: string, schoolId: string) => number;
  getTotalHoursForEmployeeByWeek: (employeeId: string) => number;
  getEditRecordsByWorkEntry: (workEntryId: string) => EditRecord[];
  getSchoolsByEmployee: (employeeId: string) => School[];
  getEmployeesBySchool: (schoolId: string) => Employee[];
  getTotalHoursForEmployeeByDay: (employeeId: string, date: string) => number;
  getTotalHoursBySchoolAndMonth: (schoolId: string, month: number, year: number) => {
    employee: Employee;
    hours: number;
  }[];
  getHistoryLogs: () => HistoryLog[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface HistoryLog {
  id: string;
  action: "create" | "update" | "delete";
  entityType: "employee" | "school" | "workEntry" | "position" | "role";
  entityId: string;
  entityName?: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

const enhancedInitialEmployees = [
  ...initialEmployees.map(emp => ({
    ...emp,
    username: emp.name.toLowerCase().replace(' ', ''),
    password: 'password',
    role: 'Usuario'
  })),
  {
    id: 'emp-admin',
    name: 'Juan Perez',
    position: 'Administrador',
    phone: '123-456-7890',
    email: 'juan@example.com',
    active: true,
    username: 'admin',
    password: 'admin',
    role: 'Administrador'
  },
  {
    id: 'emp-user',
    name: 'Maria Lopez',
    position: 'Usuario',
    phone: '098-765-4321',
    email: 'maria@example.com',
    active: true,
    username: 'user',
    password: 'user',
    role: 'Usuario'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(enhancedInitialEmployees);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initialWorkEntries);
  const [editRecords, setEditRecords] = useState<EditRecord[]>([]);
  const [positions, setPositions] = useState<Position[]>([
    { id: "pos-1", name: "Profesor" },
    { id: "pos-2", name: "Administrativo" },
    { id: "pos-3", name: "Auxiliar" }
  ]);
  const [roles, setRoles] = useState<Role[]>([
    { 
      id: "role-1", 
      name: "Administrador", 
      permissions: { 
        create: true, 
        read: true, 
        update: true, 
        delete: true 
      } 
    },
    { 
      id: "role-2", 
      name: "Editor", 
      permissions: { 
        create: true, 
        read: true, 
        update: true, 
        delete: false 
      } 
    },
    { 
      id: "role-3", 
      name: "Usuario", 
      permissions: { 
        create: true, 
        read: true, 
        update: false, 
        delete: false 
      } 
    }
  ]);
  
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = employees.find(e => 
      e.username === username && e.password === password && e.active
    );
    
    if (user) {
      if (username === 'admin' && password === 'admin') {
        const adminUser = {
          ...user,
          role: 'Administrador'
        };
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
      } else if (username === 'user' && password === 'user') {
        const regularUser = {
          ...user,
          role: 'Usuario'
        };
        setCurrentUser(regularUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(regularUser));
      } else {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      const newLog: HistoryLog = {
        id: generateId(),
        action: "create",
        entityType: "employee",
        entityId: user.id,
        entityName: user.name,
        performedBy: user.name,
        timestamp: new Date().toISOString(),
        details: "Inicio de sesión"
      };
      
      setHistoryLogs([newLog, ...historyLogs]);
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    if (currentUser) {
      const newLog: HistoryLog = {
        id: generateId(),
        action: "update",
        entityType: "employee",
        entityId: currentUser.id,
        entityName: currentUser.name,
        performedBy: currentUser.name,
        timestamp: new Date().toISOString(),
        details: "Cierre de sesión"
      };
      
      setHistoryLogs([newLog, ...historyLogs]);
    }
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const username = employee.username || employee.name.toLowerCase().replace(' ', '');
    const password = employee.password || 'password';
    
    const newEmployee = { 
      ...employee, 
      id: generateId(), 
      active: true,
      username,
      password,
      role: employee.role || 'Usuario'
    };
    
    setEmployees([...employees, newEmployee]);
    
    const performer = currentUser?.name || "Sistema";
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "create",
      entityType: "employee",
      entityId: newEmployee.id,
      entityName: newEmployee.name,
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: "Empleado creado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Empleado agregado",
      description: `${newEmployee.name} ha sido agregado correctamente.`
    });
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(employees.map(e => (e.id === employee.id ? employee : e)));
    
    if (currentUser && employee.id === currentUser.id) {
      setCurrentUser(employee);
      localStorage.setItem('currentUser', JSON.stringify(employee));
    }
    
    const performer = currentUser?.name || "Sistema";
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "update",
      entityType: "employee",
      entityId: employee.id,
      entityName: employee.name,
      performedBy: performer,
      timestamp: new Date().toISOString(),
      details: "Empleado actualizado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Empleado actualizado",
      description: `${employee.name} ha sido actualizado correctamente.`
    });
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(employees.filter(e => e.id !== id));
    
    setWorkEntries(workEntries.filter(entry => entry.employeeId !== id));
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "delete",
      entityType: "employee",
      entityId: id,
      entityName: employee?.name,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Empleado eliminado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Empleado eliminado",
      description: employee ? `${employee.name} ha sido eliminado correctamente.` : "Empleado eliminado correctamente"
    });
  };

  const addSchool = (school: Omit<School, "id">) => {
    const newSchool = { ...school, id: generateId() };
    setSchools([...schools, newSchool]);
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "create",
      entityType: "school",
      entityId: newSchool.id,
      entityName: newSchool.name,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Colegio creado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Colegio agregado",
      description: `${newSchool.name} ha sido agregado correctamente.`
    });
  };

  const updateSchool = (school: School) => {
    setSchools(schools.map(s => (s.id === school.id ? school : s)));
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "update",
      entityType: "school",
      entityId: school.id,
      entityName: school.name,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Colegio actualizado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Colegio actualizado",
      description: `${school.name} ha sido actualizado correctamente.`
    });
  };

  const deleteSchool = (id: string) => {
    const school = schools.find(s => s.id === id);
    
    const isSchoolInUse = workEntries.some(entry => entry.schoolId === id);
    
    if (isSchoolInUse) {
      toast({
        title: "Error al eliminar",
        description: "Este colegio no puede ser eliminado porque tiene registros de horas asociados. Use 'Eliminar y restablecer' para borrar todos sus registros.",
        variant: "destructive"
      });
      return;
    }
    
    setSchools(schools.filter(s => s.id !== id));
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "delete",
      entityType: "school",
      entityId: id,
      entityName: school?.name,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Colegio eliminado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Colegio eliminado",
      description: school ? `${school.name} ha sido eliminado correctamente.` : "Colegio eliminado correctamente"
    });
  };

  const deleteSchoolAndResetHours = (id: string) => {
    const school = schools.find(s => s.id === id);
    if (!school) return;
    
    const relatedEntries = workEntries.filter(entry => entry.schoolId === id);
    
    setWorkEntries(workEntries.filter(entry => entry.schoolId !== id));
    
    setSchools(schools.filter(s => s.id !== id));
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "delete",
      entityType: "school",
      entityId: id,
      entityName: school?.name,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: `Colegio eliminado con ${relatedEntries.length} registros de horas`
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Colegio eliminado",
      description: `${school.name} ha sido eliminado correctamente junto con todos sus registros de horas.`
    });
  };

  const addWorkEntry = (entry: Omit<WorkEntry, "id">) => {
    const now = new Date();
    const newEntry = { 
      ...entry, 
      id: generateId(),
      lastEditedBy: currentUser?.name || "Sistema",
      lastEditedAt: now.toISOString()
    };
    setWorkEntries([...workEntries, newEntry]);
    
    const employee = getEmployeeById(newEntry.employeeId);
    const school = getSchoolById(newEntry.schoolId);
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "create",
      entityType: "workEntry",
      entityId: newEntry.id,
      entityName: `${employee?.name || "Desconocido"} - ${school?.name || "Desconocido"}`,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: `Registro de ${newEntry.hours} horas creado`
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Horas registradas",
      description: "Las horas de trabajo se han registrado correctamente."
    });
  };

  const updateWorkEntry = (entry: WorkEntry, editorName: string) => {
    const originalEntry = workEntries.find(e => e.id === entry.id);
    
    if (originalEntry && originalEntry.hours !== entry.hours) {
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
      
      const updatedEntry = {
        ...entry,
        lastEditedBy: editorName,
        lastEditedAt: now.toISOString()
      };
      
      setWorkEntries(workEntries.map(e => (e.id === entry.id ? updatedEntry : e)));
    } else {
      const updatedEntry = {
        ...entry,
        lastEditedBy: editorName,
        lastEditedAt: new Date().toISOString()
      };
      setWorkEntries(workEntries.map(e => (e.id === entry.id ? updatedEntry : e)));
    }
    
    const newLog: HistoryLog = {
      id: generateId(),
      action: "update",
      entityType: "workEntry",
      entityId: entry.id,
      entityName: `${getEmployeeById(entry.employeeId)?.name || "Desconocido"} - ${getSchoolById(entry.schoolId)?.name || "Desconocido"}`,
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Registro actualizado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
    toast({
      title: "Registro actualizado",
      description: "Las horas de trabajo se han actualizado correctamente."
    });
  };

  const deleteWorkEntry = (id: string) => {
    setWorkEntries(workEntries.filter(e => e.id !== id));
    const newLog: HistoryLog = {
      id: generateId(),
      action: "delete",
      entityType: "workEntry",
      entityId: id,
      entityName: "Desconocido",
      performedBy: currentUser?.name || "Sistema",
      timestamp: new Date().toISOString(),
      details: "Registro eliminado"
    };
    
    setHistoryLogs([newLog, ...historyLogs]);
    
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

  const addRole = (role: Omit<Role, "id">) => {
    const newRole = { ...role, id: generateId() };
    setRoles([...roles, newRole]);
    toast({
      title: "Rol agregado",
      description: `El rol ${newRole.name} ha sido agregado correctamente.`
    });
  };

  const updateRole = (role: Role) => {
    setRoles(roles.map(r => (r.id === role.id ? role : r)));
    toast({
      title: "Rol actualizado",
      description: `El rol ${role.name} ha sido actualizado correctamente.`
    });
  };

  const deleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    
    const isRoleInUse = employees.some(e => e.role === role?.name);
    
    if (isRoleInUse) {
      toast({
        title: "Error al eliminar",
        description: "Este rol no puede ser eliminado porque está siendo utilizado por empleados.",
        variant: "destructive"
      });
      return false;
    }
    
    if (role?.name === "Administrador") {
      const adminRoles = roles.filter(r => r.name === "Administrador");
      if (adminRoles.length <= 1) {
        toast({
          title: "Error al eliminar",
          description: "No se puede eliminar el único rol de Administrador. Debe existir al menos un administrador en el sistema.",
          variant: "destructive"
        });
        return false;
      }
    }
    
    setRoles(roles.filter(r => r.id !== id));
    toast({
      title: "Rol eliminado",
      description: role ? `El rol ${role.name} ha sido eliminado correctamente.` : "Rol eliminado correctamente"
    });
    return true;
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

  const getTotalHoursForEmployeeByWeek = (employeeId: string) => {
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

  const getTotalHoursBySchoolAndMonth = (schoolId: string, month: number, year: number) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    const schoolEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entry.schoolId === schoolId &&
        entryDate >= startOfMonth &&
        entryDate <= endOfMonth
      );
    });
    
    const employeeHoursMap = new Map<string, number>();
    
    schoolEntries.forEach(entry => {
      const currentHours = employeeHoursMap.get(entry.employeeId) || 0;
      employeeHoursMap.set(entry.employeeId, currentHours + entry.hours);
    });
    
    const result = Array.from(employeeHoursMap.entries()).map(([employeeId, hours]) => {
      const employee = employees.find(e => e.id === employeeId);
      return {
        employee: employee!,
        hours
      };
    }).filter(item => item.employee);
    
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

  const getHistoryLogs = () => {
    return historyLogs;
  };

  const contextValue: AppContextType = {
    employees,
    schools,
    workEntries,
    editRecords,
    positions,
    roles,
    isAuthenticated,
    currentUser,
    login,
    logout,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSchool,
    updateSchool,
    deleteSchool,
    deleteSchoolAndResetHours,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    addPosition,
    updatePosition,
    deletePosition,
    addRole,
    updateRole,
    deleteRole,
    getEmployeeById,
    getSchoolById,
    getWorkEntriesByEmployeeAndDate,
    getTotalHoursByEmployeeThisWeek,
    getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear,
    getTotalHoursBySchoolThisMonth,
    getTotalHoursByEmployeeAndSchoolThisMonth,
    getTotalHoursForEmployeeByWeek,
    getEditRecordsByWorkEntry,
    getSchoolsByEmployee,
    getEmployeesBySchool,
    getTotalHoursForEmployeeByDay,
    getTotalHoursBySchoolAndMonth,
    getHistoryLogs
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
