
import React from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { School } from "@/types";

const formSchema = z.object({
  name: z.string()
    .min(1, { message: "El nombre es obligatorio." })
    .max(100, { message: "El nombre no debe exceder los 100 caracteres." }),
});

type SchoolFormProps = {
  initialData?: School;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
};

export function SchoolForm({ initialData, onSubmit, onCancel }: SchoolFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
        }
      : {
          name: "",
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Colegio</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del colegio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit">{initialData ? "Actualizar" : "Agregar"}</Button>
        </div>
      </form>
    </Form>
  );
}
