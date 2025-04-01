
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, BarChart3 } from "lucide-react";
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
import { SchoolForm } from "@/components/SchoolForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Schools = () => {
  const { schools, workEntries, addSchool, updateSchool, deleteSchool, getTotalHoursBySchoolThisMonth } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<any>(null);

  // Calculate total hours per school for this month
  const schoolHours = schools.map(school => {
    const entries = workEntries.filter(entry => entry.schoolId === school.id);
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const monthlyHours = getTotalHoursBySchoolThisMonth(school.id);
    
    return {
      ...school,
      totalHours,
      monthlyHours,
      entries: entries.length
    };
  });

  const handleAddSubmit = (data: { name: string }) => {
    addSchool({
      name: data.name
    });
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (data: { name: string }) => {
    if (currentSchool) {
      updateSchool({
        id: currentSchool.id,
        name: data.name
      });
    }
    setIsEditDialogOpen(false);
    setCurrentSchool(null);
  };

  const handleDelete = () => {
    if (currentSchool) {
      deleteSchool(currentSchool.id);
    }
    setIsDeleteDialogOpen(false);
    setCurrentSchool(null);
  };

  const openEditDialog = (school: any) => {
    setCurrentSchool(school);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (school: any) => {
    setCurrentSchool(school);
    setIsDeleteDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Colegios</h1>
          <p className="text-gray-600">Gestiona los colegios en el sistema</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar Colegio</span>
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Colegios</TabsTrigger>
          <TabsTrigger value="reports">Reportes Mensuales</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="bg-white rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Total de Horas</TableHead>
                  <TableHead>Cantidad de Registros</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolHours.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.totalHours} horas</TableCell>
                    <TableCell>{school.entries} registros</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(school)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(school)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolHours.map((school) => (
              <Card key={school.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{school.name}</h3>
                  <div className="bg-blue-100 text-blue-800 p-1 rounded flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Mes actual</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Registros totales</span>
                  <span>{school.entries}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Horas totales</span>
                  <span>{school.totalHours} horas</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-3 border-t">
                  <span>Horas este mes</span>
                  <span className="text-blue-700">{school.monthlyHours} horas</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Colegio</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo colegio. Click en Agregar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <SchoolForm
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colegio</DialogTitle>
            <DialogDescription>
              Actualiza la información del colegio. Click en Actualizar cuando termines.
            </DialogDescription>
          </DialogHeader>
          {currentSchool && (
            <SchoolForm
              initialData={currentSchool}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio.
              <br />
              <strong className="text-red-500">
                Nota: No se puede eliminar un colegio que tenga registros de horas asociados.
              </strong>
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

export default Schools;
