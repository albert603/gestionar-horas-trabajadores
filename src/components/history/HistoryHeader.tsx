
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, History } from "lucide-react";

interface HistoryHeaderProps {
  onRefresh: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historial</h1>
          <p className="text-gray-600">Registro de actividades y cambios en el sistema</p>
        </div>
      </div>
      <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        <span>Actualizar</span>
      </Button>
    </div>
  );
};
