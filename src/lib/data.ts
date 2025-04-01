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

export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[date.getDay()];
}

export function getCurrentWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the first day of the week (Sunday)
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - day);
  
  // Generate array of dates for the week
  return Array(7).fill(0).map((_, index) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + index);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
}

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
