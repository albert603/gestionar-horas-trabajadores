
import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Employee, Position } from "@/types";
import { useApp } from "@/context/AppContext";
import { Shield, User, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  position: z.string().min(1, {
    message: "Seleccione un cargo.",
  }),
  phone: z.string().min(5, {
    message: "El teléfono debe tener al menos 5 caracteres.",
  }),
  email: z.string().email({
    message: "Ingrese un email válido.",
  }),
  role: z.string().optional(),
  username: z.string().min(4, {
    message: "El nombre de usuario debe tener al menos 4 caracteres."
  }).optional(),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres."
  }).optional(),
});

type EmployeeFormProps = {
  initialData?: Employee;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
};

export function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const { positions, roles, employees } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [formValidationAlert, setFormValidationAlert] = useState<string | null>(null);
  
  // Configurar el formulario con los valores iniciales
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      position: "",
      phone: "",
      email: "",
      role: "",
      username: "",
      password: "",
    },
  });

  // Limpiar alertas cuando cambian los valores del formulario
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormValidationAlert(null);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Validación del nombre de usuario
    if (data.username) {
      const existingUser = employees.find(
        e => e.username === data.username && e.id !== initialData?.id
      );
      
      if (existingUser) {
        setFormValidationAlert("El nombre de usuario ya está en uso. Por favor, elija otro.");
        setActiveTab("credentials");
        return;
      }
    }
    
    // Validación del email
    if (data.email) {
      const existingEmail = employees.find(
        e => e.email === data.email && e.id !== initialData?.id
      );
      
      if (existingEmail) {
        setFormValidationAlert("El email ya está en uso por otro empleado.");
        setActiveTab("info");
        return;
      }
    }
    
    // Validaciones especiales para edición
    if (initialData) {
      // Validar cambios de rol de administrador
      if (initialData.role === "Administrador" && data.role !== "Administrador") {
        const adminCount = employees.filter(e => e.role === "Administrador" && e.id !== initialData.id).length;
        if (adminCount < 1) {
          setFormValidationAlert("No se puede cambiar el rol del último administrador.");
          setActiveTab("info");
          return;
        }
      }
      
      // Si estamos editando y no se proporcionó una contraseña, mantenemos la existente
      if (!data.password) {
        data.password = initialData.password;
      }
    } else {
      // Validar que los campos de credenciales estén completos si se está creando un empleado
      if (data.role && data.role !== "no_role" && (!data.username || !data.password)) {
        setFormValidationAlert("Para usuarios con privilegios, debe proporcionar un nombre de usuario y contraseña.");
        setActiveTab("credentials");
        return;
      }
    }
    
    // Pasamos los datos procesados al manejador onSubmit
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {formValidationAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de validación</AlertTitle>
            <AlertDescription>{formValidationAlert}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="credentials">Credenciales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.name}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Privilegios</span>
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Si se selecciona un rol con privilegios, cambiar a la pestaña de credenciales
                      if (value !== "no_role" && value !== "") {
                        setActiveTab("credentials");
                      }
                    }} 
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel de acceso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_role">Sin privilegios</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.value && field.value !== "no_role" && !form.getValues("username") && (
                    <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Los usuarios con privilegios requieren credenciales de acceso</span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="credentials" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Nombre de Usuario</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="usuario123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    <span>Contraseña</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder={initialData ? "••••••••" : "Contraseña"} 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <p className="text-sm text-muted-foreground mt-4">
              {initialData ? 
                "Si no desea cambiar la contraseña, deje este campo vacío." : 
                "Cree credenciales seguras para que el empleado pueda acceder al sistema."
              }
            </p>
            
            {initialData && initialData.role && initialData.role !== "no_role" && !form.getValues("username") && (
              <Alert variant="warning" className="mt-2 border-amber-300 bg-amber-50 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>Este usuario tiene privilegios pero no tiene credenciales de acceso. No podrá iniciar sesión.</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit">{initialData ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Form>
  );
}
