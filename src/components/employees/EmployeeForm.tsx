
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types";
import { useApp } from "@/context/AppContext";
import { InfoFields } from "./InfoFields";
import { CredentialsFields } from "./CredentialsFields";
import { FormTabs } from "./FormTabs";
import { ValidationAlert } from "./ValidationAlert";

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

  const handleRoleChange = (value: string) => {
    // Si se selecciona un rol con privilegios, cambiar a la pestaña de credenciales
    if (value !== "no_role" && value !== "") {
      setActiveTab("credentials");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <ValidationAlert message={formValidationAlert} />
        
        <FormTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          infoTabContent={
            <InfoFields 
              form={form} 
              positions={positions} 
              roles={roles} 
              onRoleChange={handleRoleChange}
            />
          }
          credentialsTabContent={
            <CredentialsFields 
              form={form} 
              initialData={initialData} 
            />
          }
        />

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
