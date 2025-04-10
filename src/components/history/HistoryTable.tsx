
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { HistoryLog } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  Pencil, 
  Trash, 
  School, 
  Users, 
  Briefcase, 
  Shield
} from "lucide-react";

interface HistoryTableProps {
  isLoading: boolean;
  filteredLogs: HistoryLog[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ 
  isLoading, 
  filteredLogs 
}) => {
  const getActionIcon = (action: string = "") => {
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
    switch (entityType?.toLowerCase()) {
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
    switch (entityType?.toLowerCase()) {
      case "employee": return "Empleado";
      case "school": return "Colegio";
      case "workentry": return "Registro de horas";
      case "position": return "Cargo";
      case "role": return "Privilegio";
      default: return entityType || "Acción";
    }
  };

  const getActionText = (action: string = "") => {
    switch (action?.toLowerCase()) {
      case "añadir": return "Creación";
      case "actualizar": return "Actualización";
      case "eliminar": return "Eliminación";
      case "create": return "Creación";
      case "update": return "Actualización";
      case "delete": return "Eliminación";
      default: return action || "Acción";
    }
  };
  
  const getActionBadgeColor = (action: string = "") => {
    switch (action?.toLowerCase()) {
      case "añadir":
      case "create": return "bg-green-100 text-green-800";
      case "actualizar":
      case "update": return "bg-blue-100 text-blue-800";
      case "eliminar":
      case "delete": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredLogs.length > 0 ? (
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
                    <span>{log.performedBy || "Sistema"}</span>
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
                <div className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500">No se encontraron registros que coincidan con los filtros.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
