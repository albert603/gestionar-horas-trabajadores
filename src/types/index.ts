
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
  lastEditedBy?: string; // Añadimos quién editó por última vez
  lastEditedAt?: string; // Añadimos cuándo se editó por última vez
}

export interface EditRecord {
  id: string;
  workEntryId: string;
  editedBy: string;
  editedAt: string;
  previousHours: number;
  newHours: number;
}
