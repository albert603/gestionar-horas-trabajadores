
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/EmployeeForm";
import { Employee } from "@/types";
import { Pencil, Trash2, UserPlus, Mail, Phone, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, roles } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (data: Omit<Employee, "id" | "active">) => {
    addEmployee({ ...data, active: true });
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (data: Omit<Employee, "id" | "active">) => {
    if (currentEmployee) {
      updateEmployee({ ...data, id: currentEmployee.id, active: currentEmployee.active });
    }
    setIsEditDialogOpen(false);
    setCurrentEmployee(null);
  };

  const handleDelete = () => {
    if (currentEmployee) {
      deleteEmployee(currentEmployee.id);
    }
    setIsDeleteDialogOpen(false);
    setCurrentEmployee(null);
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  // Helper function to get badge variant based on role
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "Administrador":
        return "destructive";
      case "Editor":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Empleados</h1>
          <p className="text-gray-600">Gestiona la información de los empleados</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Añadir Empleado</span>
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar empleados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Privilegios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.role ? (
                        <Badge variant={getRoleBadgeVariant(employee.role)} className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {employee.role}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(employee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Empleado</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo empleado. Click en Crear cuando termines.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>
              Actualiza la información del empleado. Click en Actualizar cuando termines.
            </DialogDescription>
          </DialogHeader>
          {currentEmployee && (
            <EmployeeForm
              initialData={currentEmployee}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>{currentEmployee?.name}</strong> del sistema y todos sus registros de horas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Employees;
