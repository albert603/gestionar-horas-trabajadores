
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterEntity: string;
  setFilterEntity: (value: string) => void;
  filterAction: string;
  setFilterAction: (value: string) => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterEntity,
  setFilterEntity,
  filterAction,
  setFilterAction,
}) => {
  return (
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
  );
};
