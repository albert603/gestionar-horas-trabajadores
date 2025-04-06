
import React from "react";
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
import { AlertTriangle } from "lucide-react";
import { School } from "@/types";

interface SchoolDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  currentSchool: School | null;
  hasWorkEntries: (schoolId: string) => boolean;
  handleAddSubmit: (data: { name: string }) => void;
  handleEditSubmit: (data: { name: string }) => void;
  handleDelete: () => void;
}

export const SchoolDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  currentSchool,
  hasWorkEntries,
  handleAddSubmit,
  handleEditSubmit,
  handleDelete,
}: SchoolDialogsProps) => {
  return (
    <>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio y todos sus registros de horas asociados.
              {currentSchool && hasWorkEntries(currentSchool.id) && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Atención</p>
                    <p className="text-sm">Este colegio tiene registros de horas asociados. Los registros históricos se mantendrán pero no se podrán añadir más horas a este colegio.</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
