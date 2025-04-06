
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';

interface RoleContextType {
  roles: Role[];
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ 
  children: React.ReactNode;
  initialRoles: Role[];
}> = ({ children, initialRoles }) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const addHistoryLog = useAddHistoryLog();

  const addRole = (role: Omit<Role, "id">) => {
    const newRole: Role = {
      ...role,
      id: uuidv4()
    };
    setRoles(prev => [...prev, newRole]);
    addHistoryLog("Añadir", `Se añadió el rol ${newRole.name}`);
  };

  const updateRole = (role: Role) => {
    setRoles(prev => 
      prev.map(r => r.id === role.id ? role : r)
    );
    addHistoryLog("Actualizar", `Se actualizó el rol ${role.name}`);
  };

  const deleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.name === "Administrador") {
      const adminRoles = roles.filter(r => r.name === "Administrador");
      if (adminRoles.length <= 1) {
        addHistoryLog(
          "Error", 
          "Intento de eliminar el único rol de Administrador", 
          "Sistema"
        );
        return;
      }
    }
    
    setRoles(prev => prev.filter(r => r.id !== id));
    addHistoryLog("Eliminar", `Se eliminó el rol ${role?.name || id}`);
  };

  const roleContextValue: RoleContextType = {
    roles,
    addRole,
    updateRole,
    deleteRole
  };

  return (
    <RoleContext.Provider value={roleContextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
