
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Position, Role } from "@/types";
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

type InfoFieldsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  positions: Position[];
  roles: Role[];
  onRoleChange: (value: string) => void;
};

export function InfoFields({ form, positions, roles, onRoleChange }: InfoFieldsProps) {
  return (
    <>
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
                onRoleChange(value);
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
    </>
  );
}
