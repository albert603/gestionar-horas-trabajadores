
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
        console.log("AuthProvider - Verificando sesión existente...");
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log("Usuario encontrado en localStorage:", user.name);
            
            // Verify the user data
            if (!user.id || !user.name) {
              console.error("Datos de usuario inválidos en localStorage");
              localStorage.removeItem('currentUser');
              return;
            }
            
            // Find the user in the database
            try {
              console.log("Buscando usuario en base de datos con ID:", user.id);
              const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('id', user.id)
                .eq('active', true)
                .single();
                
              if (error) {
                console.error("Error al verificar usuario en base de datos:", error);
                localStorage.removeItem('currentUser');
                return;
              }
              
              if (!data) {
                console.error("Usuario no encontrado en base de datos");
                localStorage.removeItem('currentUser');
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
            }
          } catch (parseError) {
            console.error("Error al parsear datos de usuario:", parseError);
            localStorage.removeItem('currentUser');
          }
        } else {
          console.log("No hay sesión guardada en localStorage");
        }
      } catch (e) {
        console.error("Error general al verificar sesión:", e);
        localStorage.removeItem('currentUser');
      }
    };
    
    checkSession();
  }, [updateEmployeeState]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Intento de login para usuario:", username);
      
      // Si no hay conexión a la base de datos, intenta usar los datos iniciales
      if (employees && employees.length > 0) {
        console.log("Verificando credenciales con datos locales...");
        const foundUser = employees.find(
          (emp) => emp.username === username && emp.password === password && emp.active
        );
        
        if (foundUser) {
          console.log("Login exitoso con datos locales para:", foundUser.name);
          setCurrentUser(foundUser);
          setIsAuthenticated(true);
          updateEmployeeState(foundUser);
          localStorage.setItem('currentUser', JSON.stringify(foundUser));
          return true;
        }
      }
      
      // Verificación con la base de datos
      console.log("Verificando credenciales con base de datos...");
      // Important change: remove the space after username in the query
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('active', true);
      
      console.log("Resultado de la consulta:", data, error);
      
      if (error) {
        console.error("Error en la consulta de autenticación:", error);
        toast({
          title: "Error de autenticación",
          description: "Error al intentar verificar credenciales.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!data || data.length === 0) {
        console.error("Credenciales incorrectas o usuario inactivo");
        toast({
          title: "Error de inicio de sesión",
          description: "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
        return false;
      }
      
      const user = data[0] as Employee;
      
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

  // Mostrar información de contexto para depuración
  console.log("AuthProvider - Estado actual:", { 
    isAuthenticated, 
    currentUser: currentUser?.name 
  });

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
