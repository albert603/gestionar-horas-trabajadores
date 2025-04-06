
import React, { useState } from "react";
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { School } from "@/types";

interface SchoolsListProps {
  schools: any[];
  expandedSchools: Record<string, boolean>;
  toggleSchoolExpand: (schoolId: string) => void;
  openEditDialog: (school: any) => void;
  openDeleteDialog: (school: any) => void;
  openForceDeleteDialog: (school: any) => void;
  hasWorkEntries: (schoolId: string) => boolean;
}

export const SchoolsList = ({
  schools,
  expandedSchools,
  toggleSchoolExpand,
  openEditDialog,
  openDeleteDialog,
  openForceDeleteDialog,
  hasWorkEntries,
}: SchoolsListProps) => {
  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Total de Horas</TableHead>
            <TableHead>Profesores</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <React.Fragment key={school.id}>
              <TableRow>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.totalHours} horas</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{school.employees?.length || 0} profesores</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSchoolExpand(school.id)}
                      className="h-7 w-7 p-0"
                    >
                      {expandedSchools[school.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(school)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(school)}
                          className={hasWorkEntries(school.id) ? "text-gray-400 cursor-not-allowed" : ""}
                          disabled={hasWorkEntries(school.id)}
                        >
                          {hasWorkEntries(school.id) && (
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                          )}
                          Eliminar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openForceDeleteDialog(school)}>
                          Eliminar y restablecer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              {expandedSchools[school.id] && (
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="py-3">
                    {school.employees && school.employees.length > 0 ? (
                      <div className="pl-6 space-y-2">
                        <h4 className="font-medium text-sm">Profesores asignados:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {school.employees.map((employee: any) => (
                            <div 
                              key={employee.id} 
                              className="flex items-center gap-2 p-2 bg-white border rounded-md"
                            >
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.position}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">No hay profesores asignados a este colegio</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
