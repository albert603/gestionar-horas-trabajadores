
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useApp } from "@/context/AppContext";
import { Role } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const RolesPage = () => {
  const { roles, addRole, updateRole, deleteRole } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<{
    name: "Administrador" | "Editor" | "Usuario";
    permissions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  }>({
    name: "Usuario",
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false,
    },
  });

  const handleAddNewRole = () => {
    setCurrentRole(null);
    setFormData({
      name: "Usuario",
      permissions: {
        create: true,
        read: true,
        update: false,
        delete: false,
      },
    });
    setOpenDialog(true);
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setFormData({
      name: role.name,
      permissions: { ...role.permissions },
    });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (currentRole) {
      updateRole({
        ...currentRole,
        name: formData.name,
        permissions: formData.permissions,
      });
    } else {
      addRole(formData);
    }
    setOpenDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (openDeleteAlert) {
      deleteRole(openDeleteAlert);
      setOpenDeleteAlert(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Privilegios</h1>
        <p className="text-gray-600">
          Gestione los roles y sus permisos en el sistema
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-medium">Roles del Sistema</h2>
        </div>
        <Button onClick={handleAddNewRole}>Nuevo Rol</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles y Permisos</CardTitle>
          <CardDescription>
            Define qué acciones puede realizar cada tipo de usuario en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Rol</TableHead>
                <TableHead>Crear</TableHead>
                <TableHead>Leer</TableHead>
                <TableHead>Actualizar</TableHead>
                <TableHead>Eliminar</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Badge
                      variant={
                        role.name === "Administrador"
                          ? "destructive"
                          : role.name === "Editor"
                          ? "outline"
                          : "default"
                      }
                    >
                      {role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.permissions.create ? "✓" : "✗"}
                  </TableCell>
                  <TableCell>
                    {role.permissions.read ? "✓" : "✗"}
                  </TableCell>
                  <TableCell>
                    {role.permissions.update ? "✓" : "✗"}
                  </TableCell>
                  <TableCell>
                    {role.permissions.delete ? "✓" : "✗"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setOpenDeleteAlert(role.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No hay roles definidos. Crea el primero.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing roles */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRole ? "Editar Rol" : "Nuevo Rol"}
            </DialogTitle>
            <DialogDescription>
              Define el nombre y los permisos para este rol
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Tipo de Rol</Label>
              <select
                id="role-name"
                value={formData.name}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    name: e.target.value as "Administrador" | "Editor" | "Usuario"
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="Administrador">Administrador</option>
                <option value="Editor">Editor</option>
                <option value="Usuario">Usuario</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Permisos</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create"
                    checked={formData.permissions.create}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          create: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="create">Crear registros</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read"
                    checked={formData.permissions.read}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          read: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="read">Leer registros</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update"
                    checked={formData.permissions.update}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          update: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="update">Actualizar registros</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delete"
                    checked={formData.permissions.delete}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          delete: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="delete">Eliminar registros</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {currentRole ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!openDeleteAlert} onOpenChange={() => setOpenDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este rol?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminar un rol podría afectar a los usuarios que lo tengan asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RolesPage;
