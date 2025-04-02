import { Employee, School, WorkEntry } from "../types";

// Mock data
export const initialSchools: School[] = [
  { id: "1", name: "Colegio San José" },
  { id: "2", name: "Escuela Primaria Libertad" },
  { id: "3", name: "Instituto Nacional" },
  { id: "4", name: "Colegio Santa María" },
  { id: "5", name: "Escuela Técnica N°1" },
];

export const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Juan Pérez",
    position: "Profesor",
    phone: "555-1234",
    email: "juan@ejemplo.com",
    active: true,
  },
  {
    id: "2",
    name: "María López",
    position: "Administrador",
    phone: "555-5678",
    email: "maria@ejemplo.com",
    active: true,
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    position: "Mantenimiento",
    phone: "555-9012",
    email: "carlos@ejemplo.com",
    active: true,
  },
];

export const initialWorkEntries: WorkEntry[] = [
  {
    id: "1",
    employeeId: "1",
    schoolId: "1",
    date: "2023-09-25",
    hours: 8,
    lastEditedBy: "Sistema",
    lastEditedAt: "2023-09-25T12:00:00Z"
  },
  {
    id: "2",
    employeeId: "1",
    schoolId: "2",
    date: "2023-09-26",
    hours: 6,
    lastEditedBy: "Sistema",
    lastEditedAt: "2023-09-26T12:00:00Z"
  },
  {
    id: "3",
    employeeId: "2",
    schoolId: "1",
    date: "2023-09-25",
    hours: 7,
    lastEditedBy: "Sistema",
    lastEditedAt: "2023-09-25T12:00:00Z"
  },
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Returns the day of the week for a given date string
 * @param dateString Date string in ISO format (YYYY-MM-DD)
 */
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return days[date.getDay()];
};

/**
 * Returns the dates for the current week, starting on Monday
 */
export const getCurrentWeekDates = (startingDate = new Date()) => {
  const currentDate = new Date(startingDate);
  const day = currentDate.getDay(); // 0 is Sunday
  
  // Calculate the Monday before (or the current day if it's Monday)
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (day === 0 ? 6 : day - 1));
  
  // Generate an array of dates for the week
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

export function getMonthName(month: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[month];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
}
