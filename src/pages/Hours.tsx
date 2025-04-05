import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkEntryForm } from "@/components/WorkEntryForm";
import { formatDate } from "@/lib/data";
import { PlusCircle, CalendarPlus, Pencil, Trash2, History, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, addWeeks, subWeeks, startOfWeek as dateStartOfWeek, endOfWeek as dateEndOfWeek } from "date-fns";
import { EditRecord } from "@/types";

const Hours = () => {
  const { 
    employees, 
    schools, 
    workEntries, 
    editRecords,
    addWorkEntry, 
    updateWorkEntry, 
    deleteWorkEntry, 
    getEmployeeById, 
    getSchoolById,
    getTotalHoursByEmployeeThisMonth,
    getTotalHoursByEmployeeThisYear,
    getEditRecordsByWorkEntry,
    getTotalHoursForEmployeeByDay,
    getTotalHoursForEmployeeByWeek,
    currentUser
  } = useApp();
  
  const isAdmin = currentUser?.role === "Administrador";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(currentUser?.id || "");
  const [editorName, setEditorName] = useState<string>(currentUser?.name || "Usuario");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(dateStartOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekOffset, setWeekOffset] = useState(0);
  
  useEffect(() => {
    if (!isAdmin && currentUser) {
      setSelectedEmployeeId(currentUser.id);
    }
  }, [currentUser, isAdmin]);
  
  const hoursBySchool = React.useMemo(() => {
    if (!selectedEmployeeId) return [];
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const employeeEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entry.employeeId === selectedEmployeeId &&
        entryDate >= startOfMonth &&
        entryDate <= endOfMonth
      );
    });
    
    const schoolHoursMap = new Map<string, number>();
    
    employeeEntries.forEach(entry => {
      const currentHours = schoolHoursMap.get(entry.schoolId) || 0;
      schoolHoursMap.set(entry.schoolId, currentHours + entry.hours);
    });
    
    return Array.from(schoolHoursMap.entries()).map(([schoolId, hours]) => {
      const school = getSchoolById(schoolId);
      return {
        schoolId,
        schoolName: school?.name || "Desconocido",
        hours
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [selectedEmployeeId, workEntries, getSchoolById]);
  
  const filteredEntries = selectedEmployeeId
    ? workEntries.filter(entry => entry.employeeId === selectedEmployeeId)
    : workEntries;

  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const weekDates = React.useMemo(() => {
    const baseDate = addWeeks(currentWeekStart, weekOffset);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(baseDate, i);
      return format(date, 'yyyy-MM-dd');
    });
  }, [currentWeekStart, weekOffset]);
  
  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };
  
  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };
  
  const handleAddSubmit = (data: any) => {
    const employeeId = isAdmin ? data.employeeId : currentUser?.id || "";
    
    if (data.entries) {
      data.entries.forEach(entry => {
        addWorkEntry({
          employeeId,
          schoolId: entry.schoolId,
          date: data.date.toISOString().split('T')[0],
          hours: entry.hours,
          startTime: entry.startTime,
          endTime: entry.endTime,
          lastEditedBy: editorName,
          lastEditedAt: new Date().toISOString()
        });
      });
    } else {
      addWorkEntry({
        employeeId,
        schoolId: data.schoolId,
        date: data.date.toISOString().split('T')[0],
        hours: data.hours,
        startTime: data.startTime,
        endTime: data.endTime,
        lastEditedBy: editorName,
        lastEditedAt: new Date().toISOString()
      });
    }
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (data: any) => {
    if (currentEntry) {
      const employeeId = isAdmin ? (data.employeeId || currentEntry.employeeId) : currentUser?.id || "";
      
      if (data.entries) {
        const entry = data.entries[0];
        updateWorkEntry({
          id: currentEntry.id,
          employeeId,
          schoolId: entry.schoolId,
          date: data.date.toISOString().split('T')[0],
          hours: entry.hours,
          startTime: entry.startTime,
          endTime: entry.endTime,
          lastEditedBy: currentEntry.lastEditedBy,
          lastEditedAt: currentEntry.lastEditedAt
        }, editorName);
      } else {
        updateWorkEntry({
          id: currentEntry.id,
          employeeId,
          schoolId: data.schoolId,
          date: data.date.toISOString().split('T')[0],
          hours: data.hours,
          startTime: data.startTime,
          endTime: data.endTime,
          lastEditedBy: currentEntry.lastEditedBy,
          lastEditedAt: currentEntry.lastEditedAt
        }, editorName);
      }
    }
    setIsEditDialogOpen(false);
    setCurrentEntry(null);
  };

  const handleDelete = () => {
    if (currentEntry) {
      deleteWorkEntry(currentEntry.id);
    }
    setIsDeleteDialogOpen(false);
    setCurrentEntry(null);
  };

  const openEditDialog = (entry: any) => {
    setCurrentEntry(entry);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (entry: any) => {
    setCurrentEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const openHistoryDialog = (entry: any) => {
    setCurrentEntry(entry);
    setIsHistoryDialogOpen(true);
  };

  const getHoursForDate = (employeeId: string, date: string) => {
    return workEntries
      .filter(entry => entry.employeeId === employeeId && entry.date === date)
      .map(entry => ({
        ...entry,
        schoolName: getSchoolById(entry.schoolId)?.name || "Desconocido"
      }));
  };

  const formatEditDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  const today = new Date().toISOString().split('T')[0];
  const todayHours = selectedEmployeeId ? getTotalHoursForEmployeeByDay(selectedEmployeeId, today) : 0;
  
  const thisWeekHours = selectedEmployeeId ? getTotalHoursForEmployeeByWeek(selectedEmployeeId) : 0;
  
  const weekRangeDisplay = () => {
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registro de Horas</h1>
          <p className="text-gray-600">Gestiona las horas trabajadas por los empleados</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Registrar Horas</span>
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {isAdmin && (
          <div className="w-full md:w-1/2">
            <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Empleado
            </label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger id="employee-select" className="w-full">
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {isAdmin && (
          <div className="w-full md:w-1/2">
            <label htmlFor="editor-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Editor
            </label>
            <input
              type="text"
              id="editor-name"
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Nombre del editor"
            />
          </div>
        )}
      </div>

      {selectedEmployeeId && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Horas Hoy</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{todayHours}</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Horas esta semana</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{thisWeekHours}</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Horas este mes</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{getTotalHoursByEmployeeThisMonth(selectedEmployeeId)}</span>
            </div>
          </Card>
        </div>
      )}

      {selectedEmployeeId && hoursBySchool.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Horas por Colegio este mes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {hoursBySchool.map(item => (
              <Card key={item.schoolId} className="p-4">
                <h4 className="font-medium text-gray-700">{item.schoolName}</h4>
                <div className="text-2xl font-bold mt-1">{item.hours}h</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Vista de Día</TabsTrigger>
          <TabsTrigger value="week">Vista Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="bg-white rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Colegio</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Editado por</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry) => {
                      const employee = getEmployeeById(entry.employeeId);
                      const school = getSchoolById(entry.schoolId);
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {employee?.name || "Desconocido"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(entry.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{school?.name || "Desconocido"}</TableCell>
                          <TableCell>{entry.hours} horas</TableCell>
                          <TableCell>
                            {entry.startTime && entry.endTime ? (
                              <span>{entry.startTime} - {entry.endTime}</span>
                            ) : (
                              <span className="text-gray-400">No especificado</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs">{entry.lastEditedBy}</span>
                              {entry.lastEditedAt && (
                                <span className="text-xs text-gray-500">
                                  {formatEditDate(entry.lastEditedAt)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openHistoryDialog(entry)}
                                className="h-8 w-8 p-0"
                                title="Ver historial"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(entry)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(entry)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                        {selectedEmployeeId
                          ? "No hay registros para este empleado"
                          : "No hay registros de horas"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week">
          {selectedEmployeeId ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Semana anterior
                </Button>
                <div className="font-medium">{weekRangeDisplay()}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextWeek}>
                    Semana siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => {
                  const dayName = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index];
                  const dayNumber = new Date(date).getDate();
                  const entries = getHoursForDate(selectedEmployeeId, date);
                  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
                  
                  return (
                    <div key={date} className="flex flex-col">
                      <div className={`text-center p-2 rounded-t-md ${index === 5 || index === 6 ? 'bg-gray-200' : 'bg-company-blue text-white'}`}>
                        <div className="font-bold">{dayName}</div>
                        <div className="text-xs">{dayNumber}</div>
                      </div>
                      <Card className="flex-1 rounded-t-none">
                        <div className="p-3">
                          {entries.length > 0 ? (
                            <div className="space-y-2">
                              {entries.map(entry => (
                                <div key={entry.id} className="text-sm border-b pb-1 last:border-b-0 last:pb-0">
                                  <div className="font-medium">{entry.schoolName}</div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">
                                      {entry.hours} horas
                                      {entry.startTime && entry.endTime && (
                                        <span className="ml-1">({entry.startTime}-{entry.endTime})</span>
                                      )}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditDialog(entry)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDeleteDialog(entry)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-20 flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentEntry({ 
                                    employeeId: selectedEmployeeId, 
                                    date 
                                  });
                                  setIsAddDialogOpen(true);
                                }}
                                className="text-gray-400 hover:text-company-blue"
                              >
                                <PlusCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {entries.length > 0 && (
                          <div className="bg-gray-100 p-2 text-center">
                            <span className="font-medium">{totalHours} horas</span>
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Selecciona un empleado para ver su horario semanal.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Horas</DialogTitle>
            <DialogDescription>
              Ingresa las horas trabajadas por el empleado. Click en Agregar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <WorkEntryForm
            schools={schools}
            initialData={currentEntry && currentEntry.date ? {
              employeeId: isAdmin ? (currentEntry.employeeId || selectedEmployeeId) : currentUser?.id,
              date: currentEntry.date,
              hours: 0
            } : { 
              employeeId: isAdmin ? selectedEmployeeId : currentUser?.id 
            }}
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setIsAddDialogOpen(false);
              if (currentEntry && currentEntry.date) {
                setCurrentEntry(null);
              }
            }}
            hideEmployeeSelect={!isAdmin}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Actualiza las horas trabajadas por el empleado. Click en Actualizar cuando termines.
            </DialogDescription>
          </DialogHeader>
          {currentEntry && (
            <WorkEntryForm
              schools={schools}
              initialData={{
                employeeId: currentEntry.employeeId,
                schoolId: currentEntry.schoolId,
                date: currentEntry.date,
                hours: currentEntry.hours,
                startTime: currentEntry.startTime,
                endTime: currentEntry.endTime
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              hideEmployeeSelect={true}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Ediciones</DialogTitle>
            <DialogDescription>
              Historial de cambios para este registro de horas
            </DialogDescription>
          </DialogHeader>
          {currentEntry && (
            <div className="mt-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="font-medium">Estado actual</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm text-gray-500">Horas:</div>
                  <div className="text-sm font-medium">{currentEntry.hours}</div>
                  <div className="text-sm text-gray-500">Última edición:</div>
                  <div className="text-sm">{currentEntry.lastEditedBy || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Fecha edición:</div>
                  <div className="text-sm">
                    {currentEntry.lastEditedAt 
                      ? formatEditDate(currentEntry.lastEditedAt)
                      : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Historial de cambios</h3>
                {(() => {
                  const history = getEditRecordsByWorkEntry(currentEntry.id);
                  
                  if (history.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 italic">
                        No hay registros de cambios para esta entrada.
                      </p>
                    );
                  }
                  
                  return (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {history.map((record: EditRecord) => (
                        <div key={record.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{record.editedBy}</span>
                            <span className="text-xs text-gray-500">
                              {formatEditDate(record.editedAt)}
                            </span>
                          </div>
                          <div className="mt-2 text-sm">
                            Cambio: <span className="line-through">{record.previousHours}</span> → 
                            <span className="font-medium"> {record.newHours}</span> horas
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setIsHistoryDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este registro de horas.
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
    </MainLayout>
  );
};

export default Hours;
