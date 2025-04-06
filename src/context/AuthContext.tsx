
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          // Verify the user still exists in the database
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', user.id)
            .eq('active', true)
            .single();
          
          if (error || !data) {
            console.log("User no longer exists or is inactive:", error);
            // Clear invalid session
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          // Update local state with the latest user data from DB
          setCurrentUser(data);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Error checking session:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First check if user exists in the local data
      const user = employees.find(e => 
        e.username === username && 
        e.password === password &&
        e.active === true
      );
      
      if (!user) {
        return false;
      }
      
      // Verify against database that user still exists and is active
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .single();
      
      if (error || !data) {
        console.log("User verification failed:", error);
        toast({
          title: "Error de autenticación",
          description: "Este usuario ya no existe o ha sido desactivado.",
          variant: "destructive",
        });
        return false;
      }
      
      // If database validation passes, proceed with login
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
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
