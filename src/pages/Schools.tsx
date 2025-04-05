
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, BarChart3, Users, CalendarRange, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SchoolForm } from "@/components/SchoolForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Schools = () => {
  const { 
    schools, 
    employees,
    workEntries, 
    addSchool, 
    updateSchool, 
    deleteSchool,
    deleteSchoolAndResetHours, 
    getTotalHoursBySchoolThisMonth,
    getEmployeeById,
    getEmployeesBySchool
  } = useApp();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth() + "-" + new Date().getFullYear()
  );
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});

  const schoolHours = schools.map(school => {
    const entries = workEntries.filter(entry => entry.schoolId === school.id);
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const monthlyHours = getTotalHoursBySchoolThisMonth(school.id);
    
    const schoolEmployees = getEmployeesBySchool(school.id);
    
    return {
      ...school,
      totalHours,
      monthlyHours,
      entries: entries.length,
      employees: schoolEmployees
    };
  });

  const handleAddSubmit = (data: { name: string }) => {
    addSchool({
      name: data.name
    });
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (data: { name: string }) => {
    if (currentSchool) {
      updateSchool({
        id: currentSchool.id,
        name: data.name
      });
    }
    setIsEditDialogOpen(false);
    setCurrentSchool(null);
  };

  const handleDelete = () => {
    if (currentSchool) {
      deleteSchool(currentSchool.id);
    }
    setIsDeleteDialogOpen(false);
    setCurrentSchool(null);
  };

  const handleForceDelete = () => {
    if (currentSchool) {
      deleteSchoolAndResetHours(currentSchool.id);
    }
    setIsForceDeleteDialogOpen(false);
    setCurrentSchool(null);
  };

  const openEditDialog = (school: any) => {
    setCurrentSchool(school);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (school: any) => {
    setCurrentSchool(school);
    setIsDeleteDialogOpen(true);
  };

  const openForceDeleteDialog = (school: any) => {
    setCurrentSchool(school);
    setIsForceDeleteDialogOpen(true);
  };

  const toggleSchoolExpand = (schoolId: string) => {
    setExpandedSchools(prev => ({
      ...prev,
      [schoolId]: !prev[schoolId]
    }));
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const month = date.getMonth();
      const year = date.getFullYear();
      const value = `${month}-${year}`;
      
      const formattedDate = format(date, "MMMM yyyy", { locale: es });
      options.push({ value, label: formattedDate });
    }
    
    return options;
  };

  const getMonthlyReportData = () => {
    if (!selectedMonth) return [];
    
    const [monthStr, yearStr] = selectedMonth.split("-");
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const filteredEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= startDate && 
        entryDate <= endDate
      );
    });
    
    const schoolReport: Record<string, any> = {};
    
    filteredEntries.forEach(entry => {
      if (!schoolReport[entry.schoolId]) {
        const school = schools.find(s => s.id === entry.schoolId);
        schoolReport[entry.schoolId] = {
          schoolName: school ? school.name : "Desconocido",
          employees: {},
          totalHours: 0
        };
      }
      
      if (!schoolReport[entry.schoolId].employees[entry.employeeId]) {
        const employee = getEmployeeById(entry.employeeId);
        schoolReport[entry.schoolId].employees[entry.employeeId] = {
          employeeName: employee ? employee.name : "Desconocido",
          hours: 0
        };
      }
      
      schoolReport[entry.schoolId].employees[entry.employeeId].hours += entry.hours;
      schoolReport[entry.schoolId].totalHours += entry.hours;
    });
    
    return Object.values(schoolReport);
  };

  const monthlyReportData = getMonthlyReportData();

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Colegios</h1>
          <p className="text-gray-600">Gestiona los colegios en el sistema</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar Colegio</span>
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Colegios</TabsTrigger>
          <TabsTrigger value="teachers">Profesores por Colegio</TabsTrigger>
          <TabsTrigger value="reports">Informes Mensuales</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="bg-white rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Total de Horas</TableHead>
                  <TableHead>Profesores</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolHours.map((school) => (
                  <React.Fragment key={school.id}>
                    <TableRow>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.totalHours} horas</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{school.employees?.length || 0} profesores</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleSchoolExpand(school.id)}
                            className="h-7 w-7 p-0"
                          >
                            {expandedSchools[school.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(school)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openDeleteDialog(school)}>
                                Eliminar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openForceDeleteDialog(school)}>
                                Eliminar y restablecer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSchools[school.id] && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={4} className="py-3">
                          {school.employees && school.employees.length > 0 ? (
                            <div className="pl-6 space-y-2">
                              <h4 className="font-medium text-sm">Profesores asignados:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {school.employees.map((employee: any) => (
                                  <div 
                                    key={employee.id} 
                                    className="flex items-center gap-2 p-2 bg-white border rounded-md"
                                  >
                                    <div>
                                      <p className="font-medium">{employee.name}</p>
                                      <p className="text-xs text-gray-500">{employee.position}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500">No hay profesores asignados a este colegio</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="teachers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolHours.map((school) => (
              <Card key={school.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{school.name}</h3>
                  <div className="bg-blue-100 text-blue-800 p-1 rounded flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{school.employees?.length || 0} profesores</span>
                  </div>
                </div>
                
                {school.employees && school.employees.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-500">Profesores asignados:</h4>
                    {school.employees.map((employee: any) => (
                      <div key={employee.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <span>{employee.name}</span>
                        <span className="text-sm text-gray-500">{employee.position}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No hay profesores asignados a este colegio
                  </div>
                )}
                
                <div className="flex justify-between font-medium text-lg pt-3 mt-2 border-t">
                  <span>Horas este mes</span>
                  <span className="text-blue-700">{school.monthlyHours} horas</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
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
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Colegio</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo colegio. Click en Agregar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <SchoolForm
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colegio</DialogTitle>
            <DialogDescription>
              Actualiza la información del colegio. Click en Actualizar cuando termines.
            </DialogDescription>
          </DialogHeader>
          {currentSchool && (
            <SchoolForm
              initialData={currentSchool}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio.
              <br />
              <strong className="text-red-500">
                Nota: No se puede eliminar un colegio que tenga registros de horas asociados.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este colegio y todos sus registros de horas asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar y restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Schools;
