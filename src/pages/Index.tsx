
import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardSummary from "@/components/SupabaseTest";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Administrador';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure database connection when page loads
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Simple test query to check connection
      const { error } = await supabase
        .from('employees')
        .select('id')
        .limit(1) as { data: any[], error: any };
      
      if (error) {
        throw error;
      }
      
      // Connection successful - but we don't need to show a notification
      // as the app should always be connected
    } catch (err) {
      console.error("Error de conexión a Supabase:", err);
      
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar a la base de datos. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">
          {isAdmin ? 'Dashboard Administrativo' : 'Mi Panel de Control'}
        </h1>
        
        <div className="grid gap-6">
          <DashboardSummary />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              {isAdmin ? 'Información del Sistema' : 'Información Personal'}
            </h2>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Esta aplicación te permite gestionar las horas trabajadas por los empleados en distintos colegios. Utiliza el menú lateral para acceder a las diferentes secciones.'
                : 'Esta aplicación te permite registrar tus horas trabajadas en los distintos colegios asignados. Utiliza el menú lateral para acceder a tus registros de horas.'}
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Nota:</span> La aplicación está conectada a una base de datos Supabase y 
                sincroniza todos los cambios automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
