
export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface School {
  id: string;
  name: string;
}

export interface WorkEntry {
  id: string;
  employeeId: string;
  schoolId: string;
  date: string;
  hours: number;
}
