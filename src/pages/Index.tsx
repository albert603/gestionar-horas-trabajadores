
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SupabaseTest from "@/components/SupabaseTest";

const Index = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Sistema de gestión de horas trabajadas</h1>
        
        <div className="grid gap-6">
          <SupabaseTest />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Bienvenido al sistema</h2>
            <p className="text-gray-600">
              Esta aplicación te permite gestionar las horas trabajadas por los empleados en distintos colegios.
              Utiliza el menú lateral para acceder a las diferentes secciones.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Nota:</span> La aplicación está conectada a una base de datos Supabase. 
                Usa el botón "Probar Conexión" arriba para verificar que todo funciona correctamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
