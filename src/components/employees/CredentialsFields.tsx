
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Employee } from "@/types";
import { z } from "zod";

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

type CredentialsFieldsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  initialData?: Employee;
};

export function CredentialsFields({ form, initialData }: CredentialsFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
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
        <Alert variant="default" className="mt-2 border-amber-300 bg-amber-50 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>Este usuario tiene privilegios pero no tiene credenciales de acceso. No podrá iniciar sesión.</AlertDescription>
        </Alert>
      )}
    </>
  );
}
