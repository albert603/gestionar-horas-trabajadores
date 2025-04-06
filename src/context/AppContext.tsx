import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Employee, 
  School, 
  WorkEntry, 
  EditRecord, 
  Position, 
  Role 
} from '@/types';

export interface HistoryLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  performedBy: string;
  entityType?: string;
  entityName?: string;
  details?: string;
}

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
  deleteSchool: (id: string) => boolean;
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

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Administrador",
    position: "Administrador",
    phone: "123-456-7890",
    email: "admin@example.com",
    active: true,
    username: "admin",
    password: "admin",
    role: "Administrador"
  },
  {
    id: "2",
    name: "Usuario Regular",
    position: "Profesor",
    phone: "123-456-7891",
    email: "user@example.com",
    active: true,
    username: "user",
    password: "user",
    role: "Usuario"
  }
];

const initialSchools: School[] = [
  {
    id: "1",
    name: "Escuela San José"
  },
  {
    id: "2",
    name: "Colegio Santa María"
  }
];

const initialPositions: Position[] = [
  {
    id: "1",
    name: "Profesor"
  },
  {
    id: "2",
    name: "Administrador"
  }
];

const initialRoles: Role[] = [
  {
    id: "1",
    name: "Administrador",
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
  },
  {
    id: "2",
    name: "Editor",
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false
    }
  },
  {
    id: "3",
    name: "Usuario",
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false
    }
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [editRecords, setEditRecords] = useState<EditRecord[]>([]);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing saved user", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const addHistoryLog = (action: string, description: string, performedBy: string = currentUser?.name || "System") => {
    const newLog: HistoryLog = {
      id: uuidv4(),
      action,
      description,
      timestamp: new Date().toISOString(),
      performedBy,
      entityType: action.toLowerCase(),
    };
    setHistoryLogs(prev => [newLog, ...prev]);
  };

  const login = (username: string, password: string): boolean => {
    const user = employees.find(e => 
      e.username === username && 
      e.password === password &&
      e.active === true
    );
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

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
      setCurrentUser(employee);
      localStorage.setItem('currentUser', JSON.stringify(employee));
    }
    
    addHistoryLog("Actualizar", `Se actualizó el empleado ${employee.name}`);
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (employee?.role === "Administrador") {
      const adminCount = employees.filter(e => e.role === "Administrador").length;
      if (adminCount <= 1) {
        addHistoryLog("Error", "Intento de eliminar el último administrador", "Sistema");
        return;
      }
    }
    
    setWorkEntries(prev => prev.filter(entry => entry.employeeId !== id));
    setEditRecords(prev => prev.filter(record => {
      const relatedWorkEntry = workEntries.find(entry => 
        entry.id === record.workEntryId && entry.employeeId === id
      );
      return !relatedWorkEntry;
    }));
    setEmployees(prev => prev.filter(e => e.id !== id));
    
    addHistoryLog("Eliminar", `Se eliminó el empleado ${employee?.name || id}`);
  };

  const addSchool = (school: Omit<School, "id">) => {
    const newSchool: School = {
      ...school,
      id: uuidv4()
    };
    setSchools(prev => [...prev, newSchool]);
    addHistoryLog("Añadir", `Se añadió el colegio ${newSchool.name}`);
  };

  const updateSchool = (school: School) => {
    setSchools(prev => 
      prev.map(s => s.id === school.id ? school : s)
    );
    addHistoryLog("Actualizar", `Se actualizó el colegio ${school.name}`);
  };

  const deleteSchool = (id: string) => {
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
      return false;
    }
  };

  const deleteSchoolAndResetHours = (id: string) => {
    try {
      const school = schools.find(s => s.id === id);
      
      if (school) {
        const entriesOfSchool = workEntries.filter(entry => entry.schoolId === id);
        const entryIds = entriesOfSchool.map(entry => entry.id);
        
        setEditRecords(prev => 
          prev.filter(record => !entryIds.includes(record.workEntryId))
        );
        
        setWorkEntries(prev => prev.filter(entry => entry.schoolId !== id));
        
        setSchools(prev => prev.filter(s => s.id !== id));
        
        addHistoryLog(
          "Eliminar", 
          `Se eliminó el colegio ${school.name} y todos sus registros asociados`
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar colegio y restablecer horas:", error);
      return false;
    }
  };

  const addWorkEntry = (entry: Omit<WorkEntry, "id">) => {
    const newEntry: WorkEntry = {
      ...entry,
      id: uuidv4(),
      lastEditedBy: currentUser?.name || "Sistema",
      lastEditedAt: new Date().toISOString()
    };
    setWorkEntries(prev => [...prev, newEntry]);
    
    const employee = employees.find(e => e.id === newEntry.employeeId);
    const school = schools.find(s => s.id === newEntry.schoolId);
    
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
    
    const employee = employees.find(e => e.id === entry.employeeId);
    const school = schools.find(s => s.id === entry.schoolId);
    
    addHistoryLog(
      "Actualizar", 
      `Se actualizaron las horas de ${employee?.name || "empleado"} en ${school?.name || "colegio"} a ${entry.hours}h`
    );
  };

  const deleteWorkEntry = (id: string) => {
    const entry = workEntries.find(e => e.id === id);
    
    setEditRecords(prev => prev.filter(record => record.workEntryId !== id));
    
    setWorkEntries(prev => prev.filter(e => e.id !== id));
    
    const employee = entry ? employees.find(e => e.id === entry.employeeId) : null;
    const school = entry ? schools.find(s => s.id === entry.schoolId) : null;
    
    addHistoryLog(
      "Eliminar", 
      `Se eliminó el registro de horas de ${employee?.name || "empleado"} en ${school?.name || "colegio"}`
    );
  };

  const addPosition = (position: Omit<Position, "id">) => {
    const newPosition: Position = {
      ...position,
      id: uuidv4()
    };
    setPositions(prev => [...prev, newPosition]);
    addHistoryLog("Añadir", `Se añadió el cargo ${newPosition.name}`);
  };

  const updatePosition = (position: Position) => {
    setPositions(prev => 
      prev.map(p => p.id === position.id ? position : p)
    );
    addHistoryLog("Actualizar", `Se actualizó el cargo ${position.name}`);
  };

  const deletePosition = (id: string) => {
    const position = positions.find(p => p.id === id);
    setPositions(prev => prev.filter(p => p.id !== id));
    addHistoryLog("Eliminar", `Se eliminó el cargo ${position?.name || id}`);
  };

  const addRole = (role: Omit<Role, "id">) => {
    const newRole: Role = {
      ...role,
      id: uuidv4()
    };
    setRoles(prev => [...prev, newRole]);
    addHistoryLog("Añadir", `Se añadió el rol ${newRole.name}`);
  };

  const updateRole = (role: Role) => {
    setRoles(prev => 
      prev.map(r => r.id === role.id ? role : r)
    );
    addHistoryLog("Actualizar", `Se actualizó el rol ${role.name}`);
  };

  const deleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.name === "Administrador") {
      const adminRoles = roles.filter(r => r.name === "Administrador");
      if (adminRoles.length <= 1) {
        addHistoryLog(
          "Error", 
          "Intento de eliminar el único rol de Administrador", 
          "Sistema"
        );
        return;
      }
    }
    
    setRoles(prev => prev.filter(r => r.id !== id));
    addHistoryLog("Eliminar", `Se eliminó el rol ${role?.name || id}`);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(employee => employee.id === id);
  };

  const getSchoolById = (id: string) => {
    return schools.find(school => school.id === id);
  };

  const getWorkEntriesByEmployeeAndDate = (employeeId: string, date: string) => {
    return workEntries.filter(
      entry => entry.employeeId === employeeId && entry.date === date
    );
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

  const getTotalHoursForEmployeeByWeek = (employeeId: string) => {
    return getTotalHoursByEmployeeThisWeek(employeeId);
  };

  const getEditRecordsByWorkEntry = (workEntryId: string) => {
    return editRecords.filter(record => record.workEntryId === workEntryId);
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

  const getTotalHoursForEmployeeByDay = (employeeId: string, date: string) => {
    return workEntries
      .filter(entry => 
        entry.employeeId === employeeId && 
        entry.date === date
      )
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

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
