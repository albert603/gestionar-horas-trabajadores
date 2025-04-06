
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardSummary from "@/components/DashboardSummary";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      toast({
        title: "Hola " + currentUser.name,
        description: "Bienvenido al sistema de gestión de horas",
      });
    }
  }, [currentUser, toast]);

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <DashboardSummary />
      </div>
    </MainLayout>
  );
};

export default Index;
