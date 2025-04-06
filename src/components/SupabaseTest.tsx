
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { School, Employee } from '@/types';
import { Building2, User, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardSummary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserPosition, setCurrentUserPosition] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();
  const isAdmin = currentUser?.role === 'Administrador';

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDashboardData();
    }
  }, [isAuthenticated, currentUser]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set current user information
      if (currentUser) {
        setCurrentUserName(currentUser.name);
        setCurrentUserPosition(currentUser.position);
      }

      // If admin, fetch counts for all employees and schools
      if (isAdmin) {
        // Fetch all employees
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('*') as { data: any[], error: any };
        
        if (employeesError) {
          throw new Error(`Error al obtener empleados: ${employeesError.message}`);
        }
        
        setEmployeesCount(employees?.length || 0);
        
        // Fetch all schools
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('*') as { data: any[], error: any };
        
        if (schoolsError) {
          throw new Error(`Error al obtener escuelas: ${schoolsError.message}`);
        }
        
        setSchoolsCount(schools?.length || 0);
        
        // Calculate total hours (placeholder - would need a work_entries table)
        // This is just a placeholder as we don't have actual work entries yet
        setHoursCount(0);
      } else {
        // For regular users, we'll only show their assigned schools
        // This would connect to a work_entries or assignments table
        // For now, just set schools to 0 until we have that table
        setSchoolsCount(0);
        setHoursCount(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos del dashboard';
      setError(errorMessage);
      console.error('Error de dashboard:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error de Conexión</CardTitle>
          <CardDescription>
            No se pudieron cargar los datos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isAdmin ? 'Resumen del Sistema' : 'Mi Panel'}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? 'Vista general de empleados, colegios y horas registradas' 
            : `Bienvenido, ${currentUserName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isAdmin && (
              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <User className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Empleados</p>
                  <p className="text-2xl font-bold">{employeesCount}</p>
                </div>
              </div>
            )}
            
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Building2 className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700">
                  {isAdmin ? 'Colegios' : 'Mis Colegios'}
                </p>
                <p className="text-2xl font-bold">{schoolsCount}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700">
                  {isAdmin ? 'Total Horas' : 'Mis Horas'}
                </p>
                <p className="text-2xl font-bold">{hoursCount}</p>
              </div>
            </div>
          </div>
        )}
        
        {!isAdmin && !isLoading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="mr-2">
                {currentUserPosition}
              </Badge>
              <p className="text-sm text-gray-500">Usuario Regular</p>
            </div>
            <p className="text-sm">
              Bienvenido a tu panel de control. Aquí podrás ver tus colegios asignados y registrar tus horas trabajadas.
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
