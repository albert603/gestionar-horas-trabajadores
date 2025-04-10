
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardSummary from "@/components/DashboardSummary";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { currentUser, isAuthenticated } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentUser) {
      toast({
        title: "Hola " + currentUser.name,
        description: isMobile ? "" : "Bienvenido al sistema de gestión de horas",
      });
    } else if (!isAuthenticated) {
      // Si no está autenticado, redirigir a login
      navigate("/login");
    }
  }, [currentUser, toast, isAuthenticated, navigate, isMobile]);

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <DashboardSummary />
      </div>
    </MainLayout>
  );
};

export default Index;
