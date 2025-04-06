
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
  isForceDeleteDialogOpen: boolean;
  setIsForceDeleteDialogOpen: (isOpen: boolean) => void;
  currentSchool: School | null;
  hasWorkEntries: (schoolId: string) => boolean;
  handleAddSubmit: (data: { name: string }) => void;
  handleEditSubmit: (data: { name: string }) => void;
  handleDelete: () => void;
  handleForceDelete: () => void;
}

export const SchoolDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isForceDeleteDialogOpen,
  setIsForceDeleteDialogOpen,
  currentSchool,
  hasWorkEntries,
  handleAddSubmit,
  handleEditSubmit,
  handleDelete,
  handleForceDelete,
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
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio.
              {currentSchool && hasWorkEntries(currentSchool.id) && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">No se puede eliminar este colegio</p>
                    <p className="text-sm">Este colegio tiene registros de horas asociados. Para eliminarlo, usa la opción "Eliminar y restablecer" que también eliminará todos los registros de horas.</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className={`bg-red-600 hover:bg-red-700 ${hasWorkEntries(currentSchool?.id || '') ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentSchool && hasWorkEntries(currentSchool.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio y todos sus registros de horas asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar y restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
