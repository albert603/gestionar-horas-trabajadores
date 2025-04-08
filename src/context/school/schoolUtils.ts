
import { School, WorkEntry, Employee } from '@/types';

export const getSchoolById = (schools: School[], id: string): School | undefined => {
  return schools.find(school => school.id === id);
};

export const getSchoolsByEmployee = (
  workEntries: WorkEntry[],
  schools: School[],
  employeeId: string
): School[] => {
  const uniqueSchoolIds = [...new Set(
    workEntries
      .filter(entry => entry.employeeId === employeeId)
      .map(entry => entry.schoolId)
  )];
  
  return schools.filter(school => 
    uniqueSchoolIds.includes(school.id)
  );
};

export const getEmployeesBySchool = (
  workEntries: WorkEntry[],
  employees: Employee[],
  schoolId: string
): Employee[] => {
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

export const getTotalHoursBySchoolThisMonth = (
  workEntries: WorkEntry[],
  schoolId: string
): number => {
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

export const getTotalHoursByEmployeeAndSchoolThisMonth = (
  workEntries: WorkEntry[],
  employeeId: string,
  schoolId: string
): number => {
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

export const getTotalHoursBySchoolAndMonth = (
  workEntries: WorkEntry[],
  schoolId: string,
  month: number,
  year: number,
  getEmployeeById: (id: string) => Employee | undefined
): { employee: Employee; hours: number }[] => {
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
