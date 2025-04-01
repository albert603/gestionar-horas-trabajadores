
import React from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const Schools = () => {
  const { schools, workEntries } = useApp();

  // Calculate total hours per school
  const schoolHours = schools.map(school => {
    const entries = workEntries.filter(entry => entry.schoolId === school.id);
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    
    return {
      ...school,
      totalHours,
      entries: entries.length
    };
  });

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Colegios</h1>
        <p className="text-gray-600">Información de los colegios registrados en el sistema</p>
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Total de Horas</TableHead>
              <TableHead>Cantidad de Registros</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolHours.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.totalHours} horas</TableCell>
                <TableCell>{school.entries} registros</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {schoolHours.map((school) => (
          <Card key={school.id} className="p-6">
            <h3 className="text-lg font-bold mb-2">{school.name}</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Registros</span>
              <span>{school.entries}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Horas</span>
              <span>{school.totalHours} horas</span>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default Schools;
