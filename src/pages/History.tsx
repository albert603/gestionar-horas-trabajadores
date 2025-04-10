
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/useApp";
import { MainLayout } from "@/components/layout/MainLayout";
import { HistoryLog } from "@/types";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HistoryHeader } from "@/components/history/HistoryHeader";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistoryTable } from "@/components/history/HistoryTable";
import { filterHistoryLogs } from "@/components/history/HistoryUtils";

const History = () => {
  const { getHistoryLogs } = useApp();
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  
  const fetchHistoryLogs = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching history logs...");
      const logs = await getHistoryLogs();
      console.log("History logs loaded:", logs);
      
      // Ensure logs is always an array, even if null/undefined is returned
      setHistoryLogs(logs || []);
    } catch (error) {
      console.error("Error al cargar el historial:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de actividades",
        variant: "destructive"
      });
      // Ensure historyLogs is an empty array if there's an error
      setHistoryLogs([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  const handleRefresh = () => {
    fetchHistoryLogs();
    toast({
      title: "Actualizando historial",
      description: "Se está cargando la información más reciente"
    });
  };

  const filteredLogs = filterHistoryLogs(historyLogs, filterEntity, filterAction, searchTerm);

  return (
    <MainLayout>
      <HistoryHeader onRefresh={handleRefresh} />

      <Card className="p-4">
        <HistoryFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterEntity={filterEntity}
          setFilterEntity={setFilterEntity}
          filterAction={filterAction}
          setFilterAction={setFilterAction}
        />

        <HistoryTable 
          isLoading={isLoading} 
          filteredLogs={filteredLogs} 
        />
      </Card>
    </MainLayout>
  );
};

export default History;
