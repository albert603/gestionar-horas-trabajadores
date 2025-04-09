
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SchoolReportsProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthlyReportData: any[];
}

export const SchoolReports = ({
  selectedMonth,
  setSelectedMonth,
  monthlyReportData,
}: SchoolReportsProps) => {
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const month = date.getMonth();
      const year = date.getFullYear();
      const value = `${month}-${year}`;
      
      // Use the proper format syntax for date-fns v4
      const formattedDate = format(date, "MMMM yyyy", { locale: es });
      options.push({ value, label: formattedDate });
    }
    
    return options;
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
        <div className="w-full md:w-1/3">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Mes
          </label>
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger id="month-select">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {monthlyReportData.length > 0 ? (
        <div className="divide-y">
          {monthlyReportData.map((schoolData: any, index) => (
            <div key={index} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">{schoolData.schoolName}</h4>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                  {schoolData.totalHours} horas
                </span>
              </div>
              
              <div className="ml-4 mt-2">
                <h5 className="text-sm text-gray-500 mb-2">Profesores:</h5>
                <div className="space-y-2">
                  {Object.values(schoolData.employees).map((employeeData: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{employeeData.employeeName}</span>
                      <span>{employeeData.hours} horas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No hay datos disponibles para el mes seleccionado
        </div>
      )}
    </div>
  );
};
