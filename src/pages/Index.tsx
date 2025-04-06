
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardSummary from "@/components/DashboardSummary";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | null>(null);
  const { toast } = useToast();
  const { currentUser } = useApp();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('name')
          .limit(1) as { data: any, error: any };

        if (error) {
          throw error;
        }

        setConnectionStatus('connected');
        if (currentUser) {
          toast({
            title: "Hola " + currentUser.name,
            description: "Bienvenido al sistema de gestión de horas",
          });
        }
      } catch (error) {
        console.error("Supabase connection error:", error);
        setConnectionStatus('error');
        
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con la base de datos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [toast, currentUser]);

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <DashboardSummary />
      </div>
    </MainLayout>
  );
};

export default Index;
