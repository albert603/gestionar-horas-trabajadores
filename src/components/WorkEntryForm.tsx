
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { School, WorkEntry } from "@/types";
import { CalendarIcon, PlusCircle, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const schoolEntrySchema = z.object({
  schoolId: z.string({
    required_error: "Seleccione una escuela.",
  }),
  hours: z.coerce
    .number()
    .min(0.5, { message: "Mínimo 0.5 horas." })
    .max(24, { message: "Máximo 24 horas." }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const formSchema = z.object({
  date: z.date({
    required_error: "Seleccione una fecha.",
  }),
  schoolEntries: z.array(schoolEntrySchema)
    .min(1, "Debe agregar al menos una entrada de colegio.")
});

type WorkEntryFormProps = {
  schools: School[];
  initialData?: Partial<WorkEntry>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export function WorkEntryForm({ schools, initialData, onSubmit, onCancel }: WorkEntryFormProps) {
  const [isMultipleSchools, setIsMultipleSchools] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      schoolEntries: initialData?.schoolId
        ? [{ 
            schoolId: initialData.schoolId, 
            hours: initialData.hours || 8,
            startTime: initialData.startTime || "",
            endTime: initialData.endTime || "" 
          }]
        : [{ schoolId: "", hours: 8, startTime: "", endTime: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schoolEntries"
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    if (data.schoolEntries.length === 1 && !isMultipleSchools) {
      // Formato tradicional para una sola entrada
      onSubmit({
        schoolId: data.schoolEntries[0].schoolId,
        date: data.date,
        hours: data.schoolEntries[0].hours,
        startTime: data.schoolEntries[0].startTime,
        endTime: data.schoolEntries[0].endTime
      });
    } else {
      // Para múltiples entradas, pasar un array para que el componente padre lo maneje
      onSubmit({
        date: data.date,
        entries: data.schoolEntries
      });
    }
  };

  const addSchoolEntry = () => {
    append({ schoolId: "", hours: 4, startTime: "", endTime: "" });
    setIsMultipleSchools(true);
  };

  const removeSchoolEntry = (index: number) => {
    remove(index);
    if (fields.length <= 2) {
      setIsMultipleSchools(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Colegios y Horas</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addSchoolEntry}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Agregar colegio</span>
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium">Entrada {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchoolEntry(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`schoolEntries.${index}.schoolId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colegio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un colegio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
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
                  name={`schoolEntries.${index}.hours`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas trabajadas</FormLabel>
                      <FormControl>
                        <Input type="number" min={0.5} max={24} step={0.5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name={`schoolEntries.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input 
                            type="time" 
                            className="pl-8" 
                            {...field} 
                            placeholder="Hora de inicio" 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`schoolEntries.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de finalización</FormLabel>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input 
                            type="time" 
                            className="pl-8" 
                            {...field} 
                            placeholder="Hora de finalización" 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          ))}
        </div>

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
