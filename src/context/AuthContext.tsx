
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '@/types';
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
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          // Find the user in the local employees array
          const foundUser = employees.find(emp => emp.id === user.id && emp.active === true);
          
          if (!foundUser) {
            console.log("User no longer exists or is inactive in local data");
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          // Set the authenticated user from local data instead of database
          setCurrentUser(foundUser);
          setIsAuthenticated(true);
          
          console.log("Session restored successfully:", foundUser.name);
        }
      } catch (e) {
        console.error("Error checking session:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
  }, [employees]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First check if user exists in the local data
      const user = employees.find(e => 
        e.username === username && 
        e.password === password &&
        e.active === true
      );
      
      if (!user) {
        console.log("Login failed: Invalid credentials or inactive user");
        return false;
      }
      
      // Login successful with local data
      console.log("Login successful for user:", user.name);
      
      // First update the state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Then save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    console.log("Logging out user:", currentUser?.name);
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
