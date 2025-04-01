
export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  active: boolean;
  assignedSchools?: string[]; // IDs de colegios asignados
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
  startTime?: string; // Hora de inicio (formato HH:MM)
  endTime?: string; // Hora de finalización (formato HH:MM)
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface EditRecord {
  id: string;
  workEntryId: string;
  editedBy: string;
  editedAt: string;
  previousHours: number;
  newHours: number;
}

export interface Position {
  id: string;
  name: string;
}
