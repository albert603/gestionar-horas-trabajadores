
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
import { Input } from "@/components/ui/input";
import { Position } from "@/types";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del cargo debe tener al menos 2 caracteres.",
  }),
});

const Positions = () => {
  const { positions, addPosition, updatePosition, deletePosition } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  const addForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleAddSubmit = (data: z.infer<typeof formSchema>) => {
    addPosition({ name: data.name });
    setIsAddDialogOpen(false);
    addForm.reset();
  };

  const handleEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (currentPosition) {
      updatePosition({ ...currentPosition, name: data.name });
    }
    setIsEditDialogOpen(false);
    setCurrentPosition(null);
  };

  const handleDelete = () => {
    if (currentPosition) {
      deletePosition(currentPosition.id);
    }
    setIsDeleteDialogOpen(false);
    setCurrentPosition(null);
  };

  const openEditDialog = (position: Position) => {
    setCurrentPosition(position);
    editForm.reset({ name: position.name });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (position: Position) => {
    setCurrentPosition(position);
    setIsDeleteDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cargos</h1>
          <p className="text-gray-600">Gestiona los cargos de los empleados</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Añadir Cargo</span>
        </Button>
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Cargo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length > 0 ? (
                positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(position)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(position)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                    No se encontraron cargos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Position Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Cargo</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo cargo. Click en Crear cuando termines.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Profesor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addForm.reset();
                  }} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
            <DialogDescription>
              Actualiza el nombre del cargo. Click en Actualizar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Profesor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                  Cancelar
                </Button>
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cargo
              <strong> {currentPosition?.name}</strong>.
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

export default Positions;
