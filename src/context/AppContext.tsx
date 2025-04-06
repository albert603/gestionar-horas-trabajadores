
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
