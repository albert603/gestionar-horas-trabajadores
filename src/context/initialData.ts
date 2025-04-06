
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
  },
  {
    id: "2",
    name: "Usuario Regular",
    position: "Profesor",
    phone: "123-456-7891",
    email: "user@example.com",
    active: true,
    username: "user",
    password: "user",
    role: "Usuario"
  }
];

export const initialSchools: School[] = [
  {
    id: "1",
    name: "Escuela San José"
  },
  {
    id: "2",
    name: "Colegio Santa María"
  }
];

export const initialPositions: Position[] = [
  {
    id: "1",
    name: "Profesor"
  },
  {
    id: "2",
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
    name: "Editor",
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false
    }
  },
  {
    id: "3",
    name: "Usuario",
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false
    }
  }
];
