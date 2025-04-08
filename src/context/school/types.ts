
import { School, WorkEntry, Employee } from '@/types';

export interface SchoolContextType {
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

export interface SchoolProviderProps {
  children: React.ReactNode;
  initialSchools: School[];
  workEntries: WorkEntry[];
  onDeleteWorkEntries: (schoolId: string) => void;
  employees: Employee[];
  getEmployeeById: (id: string) => Employee | undefined;
}
