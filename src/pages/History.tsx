import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  User, 
  Filter, 
  Clock, 
  Plus, 
  Pencil, 
  Trash, 
  School, 
  Users, 
  Briefcase, 
  Shield 
} from "lucide-react";
import { HistoryLog } from "@/types";

const History = () => {
  const { getHistoryLogs } = useApp();
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const historyLogs = getHistoryLogs();
  
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "añadir": 
      case "create": return <Plus className="h-4 w-4 text-green-500" />;
      case "actualizar": 
      case "update": return <Pencil className="h-4 w-4 text-blue-500" />;
      case "eliminar": 
      case "delete": return <Trash className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEntityIcon = (entityType: string = "") => {
    switch (entityType.toLowerCase()) {
      case "employee": return <Users className="h-4 w-4 text-purple-500" />;
      case "school": return <School className="h-4 w-4 text-blue-500" />;
      case "workentry": return <Clock className="h-4 w-4 text-green-500" />;
      case "position": return <Briefcase className="h-4 w-4 text-orange-500" />;
      case "role": return <Shield className="h-4 w-4 text-red-500" />;
      case "añadir": return <Plus className="h-4 w-4 text-green-500" />;
      case "actualizar": return <Pencil className="h-4 w-4 text-blue-500" />;
      case "eliminar": return <Trash className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEntityText = (entityType: string = "") => {
    switch (entityType.toLowerCase()) {
      case "employee": return "Empleado";
      case "school": return "Colegio";
      case "workentry": return "Registro de horas";
      case "position": return "Cargo";
      case "role": return "Privilegio";
      default: return entityType || "Acción";
    }
  };

  const getActionText = (action: string) => {
    switch (action.toLowerCase()) {
      case "añadir": return "Creación";
      case "actualizar": return "Actualización";
      case "eliminar": return "Eliminación";
      case "create": return "Creación";
      case "update": return "Actualización";
      case "delete": return "Eliminación";
      default: return action;
    }
  };
  
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "añadir":
      case "create": return "bg-green-100 text-green-800";
      case "actualizar":
      case "update": return "bg-blue-100 text-blue-800";
      case "eliminar":
      case "delete": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredLogs = historyLogs.filter(log => {
    const matchesEntity = filterEntity === "all" || (log.entityType && log.entityType === filterEntity);
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesSearch = searchTerm === "" || 
                         (log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesEntity && matchesAction && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historial</h1>
          <p className="text-gray-600">Registro de actividades y cambios en el sistema</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en el historial..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-48">
              <Select
                value={filterEntity}
                onValueChange={setFilterEntity}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Tipo de entidad" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  <SelectItem value="employee">Empleados</SelectItem>
                  <SelectItem value="school">Colegios</SelectItem>
                  <SelectItem value="workentry">Registros de horas</SelectItem>
                  <SelectItem value="position">Cargos</SelectItem>
                  <SelectItem value="role">Privilegios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Select
                value={filterAction}
                onValueChange={setFilterAction}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Tipo de acción" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="añadir">Creación</SelectItem>
                  <SelectItem value="actualizar">Actualización</SelectItem>
                  <SelectItem value="eliminar">Eliminación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Fecha y hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Realizado por</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getEntityIcon(log.entityType)}
                        <span>{getEntityText(log.entityType)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={cn("py-1 px-1.5", getActionBadgeColor(log.action))}>
                          <div className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <span>{getActionText(log.action)}</span>
                          </div>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                        <span>{log.performedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {log.description || log.details || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron registros que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default History;
