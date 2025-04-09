
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: Employee | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ 
  children: React.ReactNode;
  employees: Employee[];
  updateEmployeeState: (employee: Employee) => void;
}> = ({ children, employees, updateEmployeeState }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Verificando sesión existente...");
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          console.log("Usuario encontrado en localStorage:", user.name);
          
          // Find the user in the local employees array
          const foundUser = employees.find(emp => emp.id === user.id && emp.active === true);
          
          if (!foundUser) {
            console.error("Error: Usuario no encontrado en datos locales o inactivo");
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          // Verify if user exists in database
          try {
            const { data, error } = await supabase
              .from('employees')
              .select('*')
              .eq('id', user.id)
              .eq('active', true)
              .single();
              
            if (error || !data) {
              console.error("Error: Usuario no encontrado en base de datos:", error);
              localStorage.removeItem('currentUser');
              setCurrentUser(null);
              setIsAuthenticated(false);
              return;
            }
            
            // Set the authenticated user from database data
            const dbUser = data as Employee;
            console.log("Sesión restaurada para usuario:", dbUser.name);
            setCurrentUser(dbUser);
            setIsAuthenticated(true);
            
            // Update the parent state with the current user
            updateEmployeeState(dbUser);
          } catch (dbError) {
            console.error("Error al verificar usuario en base de datos:", dbError);
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("No hay sesión guardada en localStorage");
        }
      } catch (e) {
        console.error("Error general al verificar sesión:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
  }, [employees, updateEmployeeState]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Intento de login para usuario:", username);
      
      // First check if user exists in the database
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('active', true)
        .single();
      
      if (error || !data) {
        console.error("Login fallido: Credenciales inválidas o usuario inactivo", error);
        toast({
          title: "Error de inicio de sesión",
          description: "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
        return false;
      }
      
      const user = data as Employee;
      
      console.log("Login exitoso para:", user.name);
      
      // Update states
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Update the parent state with the current user
      updateEmployeeState(user);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Show toast notification
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${user.name}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error en proceso de login:", error);
      toast({
        title: "Error del sistema",
        description: "Ocurrió un error al procesar su solicitud.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    console.log("Cerrando sesión para usuario:", currentUser?.name);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const authContextValue: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
