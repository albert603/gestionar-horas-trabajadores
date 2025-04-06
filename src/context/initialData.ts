
import { Employee, School, Position, Role } from '@/types';

// Initial data
export const initialEmployees: Employee[] = [
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
  }
];

export const initialSchools: School[] = [];

export const initialPositions: Position[] = [
  {
    id: "1",
    name: "Administrador"
  }
];

export const initialRoles: Role[] = [
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
    name: "Usuario",
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false
    }
  }
];
