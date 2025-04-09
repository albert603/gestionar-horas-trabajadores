
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { fetchRoles, insertRole, updateRoleData, deleteRoleData } from './role/roleApi';
import { toast } from '@/hooks/use-toast';

interface RoleContextType {
  roles: Role[];
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ 
  children: React.ReactNode;
  initialRoles?: Role[];
}> = ({ children, initialRoles = [] }) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const addHistoryLog = useAddHistoryLog();

  // Cargar roles desde Supabase al iniciar
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching roles from database...");
        const dbRoles = await fetchRoles();
        console.log("Roles fetched:", dbRoles);
        setRoles(dbRoles);
      } catch (error) {
        console.error("Error loading roles:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los roles",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, []);

  const addRole = async (role: Omit<Role, "id">) => {
    try {
      const newRole = await insertRole(role);
      setRoles(prev => [...prev, newRole]);
      addHistoryLog("Añadir", `Se añadió el rol ${newRole.name}`);
      toast({
        title: "Éxito",
        description: `Rol "${role.name}" añadido correctamente`,
      });
    } catch (error) {
      console.error("Error adding role:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el rol",
        variant: "destructive"
      });
    }
  };

  const updateRole = async (role: Role) => {
    try {
      await updateRoleData(role);
      setRoles(prev => 
        prev.map(r => r.id === role.id ? role : r)
      );
      addHistoryLog("Actualizar", `Se actualizó el rol ${role.name}`);
      toast({
        title: "Éxito",
        description: `Rol "${role.name}" actualizado correctamente`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error", 
        description: "No se pudo actualizar el rol", 
        variant: "destructive"
      });
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const role = roles.find(r => r.id === id);
      if (role?.name === "Administrador") {
        const adminRoles = roles.filter(r => r.name === "Administrador");
        if (adminRoles.length <= 1) {
          addHistoryLog(
            "Error", 
            "Intento de eliminar el único rol de Administrador", 
            "Sistema"
          );
          toast({
            title: "Error",
            description: "No se puede eliminar el único rol de Administrador",
            variant: "destructive"
          });
          return;
        }
      }
      
      await deleteRoleData(id);
      setRoles(prev => prev.filter(r => r.id !== id));
      addHistoryLog("Eliminar", `Se eliminó el rol ${role?.name || id}`);
      toast({
        title: "Éxito",
        description: `Rol eliminado correctamente`,
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error", 
        description: "No se pudo eliminar el rol", 
        variant: "destructive"
      });
    }
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
