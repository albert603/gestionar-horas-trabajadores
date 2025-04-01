
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, School, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { employees, workEntries, schools, getSchoolById } = useApp();
  const activeEmployees = employees.filter(e => e.active).length;
  const totalHours = workEntries.reduce((sum, entry) => sum + entry.hours, 0);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Recent entries (last 5)
  const recentEntries = [...workEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const today = new Date().toISOString().split('T')[0];
  const todayHours = workEntries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.hours, 0);
  
  // Get employee schools and hours data
  const employeeSchoolsData = employees
    .filter(employee => 
      !searchTerm || employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(employee => {
      // Get all entries for this employee
      const employeeEntries = workEntries.filter(entry => entry.employeeId === employee.id);
      
      // Get unique schools this employee has worked at
      const employeeSchoolIds = [...new Set(employeeEntries.map(entry => entry.schoolId))];
      const employeeSchools = employeeSchoolIds
        .map(schoolId => getSchoolById(schoolId))
        .filter(Boolean);
      
      // Calculate total hours
      const totalHours = employeeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      
      // Calculate monthly hours
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthlyHours = employeeEntries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startOfMonth && entryDate <= endOfMonth;
        })
        .reduce((sum, entry) => sum + entry.hours, 0);
      
      return {
        ...employee,
        schools: employeeSchools,
        totalHours,
        monthlyHours
      };
    });
  
  const filteredEmployees = selectedEmployee 
    ? employeeSchoolsData.filter(e => e.id === selectedEmployee) 
    : employeeSchoolsData;

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión de empleados y horas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-gray-500">
              {activeEmployees} activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <Clock className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-gray-500">
              {todayHours} horas hoy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Colegios</CardTitle>
            <School className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-gray-500">
              En sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fecha Actual</CardTitle>
            <Calendar className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(new Date().toISOString())}</div>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('es', { weekday: 'long' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Colegios por Profesor</span>
                <div className="flex space-x-2">
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar profesor..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={selectedEmployee} 
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos los profesores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los profesores</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Colegios</TableHead>
                      <TableHead className="text-right">Horas Mes</TableHead>
                      <TableHead className="text-right">Horas Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{employee.name}</span>
                              <span className="text-xs text-gray-500">{employee.position}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {employee.schools && employee.schools.length > 0 ? (
                                employee.schools.map((school: any) => (
                                  <span 
                                    key={school.id} 
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {school.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">Sin colegios</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {employee.monthlyHours}h
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {employee.totalHours}h
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          No se encontraron profesores
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry) => {
                  const employee = employees.find(e => e.id === entry.employeeId);
                  const school = schools.find(s => s.id === entry.schoolId);
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{employee?.name || "Empleado desconocido"}</p>
                        <p className="text-sm text-gray-500">
                          {school?.name || "Colegio desconocido"} • {formatDate(entry.date)}
                        </p>
                      </div>
                      <div className="text-lg font-medium flex flex-col items-end">
                        <span>{entry.hours}h</span>
                        {entry.startTime && entry.endTime && (
                          <span className="text-xs text-gray-500">
                            {entry.startTime} - {entry.endTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros recientes</div>
            )}
            <div className="mt-4 text-center">
              <Link to="/hours" className="text-company-blue hover:underline text-sm">
                Ver todos los registros →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-2 flex justify-end">
        <div className="flex space-x-2">
          <Link 
            to="/employees" 
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            )}
          >
            Gestionar Empleados
          </Link>
          <Link 
            to="/schools" 
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            )}
          >
            Gestionar Colegios
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
