
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const SchoolMonthlyReport = () => {
  const { schools, getTotalHoursBySchoolThisMonth, getTotalHoursBySchoolAndMonth } = useApp();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  
  // Generate month options for the last 12 months
  const [months, setMonths] = useState<Array<{value: string, label: string, month: number, year: number}>>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  // Generate report data based on selection
  const [reportData, setReportData] = useState<Array<{
    employee: {
      id: string;
      name: string;
      position: string;
      email: string;
      phone: string;
      active: boolean;
    };
    hours: number;
  }>>([]);
  
  // Generate month options on component mount
  useEffect(() => {
    const now = new Date();
    const monthOptions = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = format(date, "MMMM yyyy", { locale: es });
      
      monthOptions.push({
        value: monthValue,
        label: monthLabel,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    
    setMonths(monthOptions);
    if (monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0].value);
    }
  }, []);
  
  // Update report data when school or month changes
  useEffect(() => {
    if (selectedSchool && selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      const data = getTotalHoursBySchoolAndMonth(selectedSchool, month, year);
      setReportData(data);
    } else {
      setReportData([]);
    }
  }, [selectedSchool, selectedMonth, getTotalHoursBySchoolAndMonth]);
  
  // Calculate total hours
  const totalHours = reportData.reduce((sum, item) => sum + item.hours, 0);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Informe Mensual por Colegio</h1>
        <p className="text-gray-600">Visualiza las horas trabajadas por profesor en cada colegio</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona un Colegio
          </label>
          <Select 
            value={selectedSchool} 
            onValueChange={setSelectedSchool}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un colegio" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona un Mes
          </label>
          <Select 
            value={selectedMonth} 
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSchool && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Reporte de {schools.find(s => s.id === selectedSchool)?.name || ""}
              {selectedMonth && ": " + months.find(m => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.length > 0 ? (
              <>
                <div className="rounded-md border overflow-hidden mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profesor</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((item) => (
                        <TableRow key={item.employee.id}>
                          <TableCell className="font-medium">{item.employee.name}</TableCell>
                          <TableCell>{item.employee.position}</TableCell>
                          <TableCell className="text-right">{item.hours}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={2} className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">{totalHours}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                {reportData.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {reportData.length} profesores han trabajado {totalHours} horas en este colegio durante el mes seleccionado.
                  </p>
                )}
              </>
            ) : (
              <div className="py-8 text-center text-gray-500">
                {selectedSchool ? 
                  "No hay registros para este colegio en el mes seleccionado." :
                  "Selecciona un colegio para ver el informe mensual."}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

export default SchoolMonthlyReport;
