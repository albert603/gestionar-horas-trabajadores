
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Edit, Trash, AlertTriangle, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const RolesPage = () => {
  const { roles, addRole, updateRole, deleteRole, employees } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (currentRole) {
        await updateRole({
          ...currentRole,
          name: formData.name,
          permissions: formData.permissions,
        });
      } else {
        await addRole(formData);
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Error in role operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    
    // Si no es un rol de Administrador, se puede eliminar
    if (role?.name !== "Administrador") {
      return true;
    }
    
    // Contar cuántos usuarios tienen rol de administrador
    const adminRoles = roles.filter(r => r.name === "Administrador");
    
    // Si es el único rol de administrador existente, no se puede eliminar
    if (adminRoles.length <= 1) {
      return false;
    }
    
    // Verificar si hay usuarios usando este rol específico de administrador
    const usersWithThisAdminRole = employees.filter(e => e.role === "Administrador");
    
    // Si hay usuarios con este rol y es el único rol de administrador, no se puede eliminar
    return !(usersWithThisAdminRole.length > 0 && adminRoles.length <= 1);
  };

  const handleDeleteClick = (role: Role) => {
    if (role.name === "Administrador" && !canDeleteRole(role.id)) {
      toast({
        title: "No se puede eliminar",
        description: "No se puede eliminar el único rol de Administrador. Debe existir al menos un administrador en el sistema.",
        variant: "destructive",
      });
      return;
    }
    
    setOpenDeleteAlert(role.id);
  };

  const handleDeleteConfirm = async () => {
    if (openDeleteAlert) {
      setIsLoading(true);
      try {
        const roleToDelete = roles.find(r => r.id === openDeleteAlert);
        
        if (roleToDelete?.name === "Administrador" && !canDeleteRole(openDeleteAlert)) {
          toast({
            title: "No se puede eliminar",
            description: "No se puede eliminar el único rol de Administrador. Debe existir al menos un administrador en el sistema.",
            variant: "destructive",
          });
          setOpenDeleteAlert(null);
          return;
        }
        
        await deleteRole(openDeleteAlert);
        setOpenDeleteAlert(null);
      } catch (error) {
        console.error("Error deleting role:", error);
      } finally {
        setIsLoading(false);
      }
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
        <Button onClick={handleAddNewRole} disabled={isLoading}>Nuevo Rol</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles y Permisos</CardTitle>
          <CardDescription>
            Define qué acciones puede realizar cada tipo de usuario en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 && isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Cargando roles...</span>
            </div>
          ) : (
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
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          role.name === "Administrador" && !canDeleteRole(role.id)
                            ? "text-gray-400"
                            : "text-red-500 hover:text-red-600"
                        }`}
                        onClick={() => handleDeleteClick(role)}
                        disabled={isLoading || (role.name === "Administrador" && !canDeleteRole(role.id))}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No hay roles definidos. Crea el primero.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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
              <Select 
                value={formData.name} 
                onValueChange={(value) => setFormData({
                  ...formData,
                  name: value as "Administrador" | "Editor" | "Usuario"
                })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <Label htmlFor="delete">Eliminar registros</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentRole ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                currentRole ? "Actualizar" : "Crear"
              )}
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
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RolesPage;
