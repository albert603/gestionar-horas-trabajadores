export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  active: boolean;
  username?: string;
  password?: string;
  assignedSchools?: string[]; // IDs de colegios asignados
  role?: string;
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

export interface Role {
  id: string;
  name: "Administrador" | "Editor" | "Usuario";
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}
