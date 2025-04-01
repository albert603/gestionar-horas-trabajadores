
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
import { PlusCircle, CalendarPlus, Pencil, Trash2, History, Clock } from "lucide-react";
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
import { getCurrentWeekDates, getDayOfWeek } from "@/lib/data";
import { format } from "date-fns";
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
    getEditRecordsByWorkEntry
  } = useApp();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [editorName, setEditorName] = useState<string>("Usuario");
  
  const filteredEntries = selectedEmployeeId
    ? workEntries.filter(entry => entry.employeeId === selectedEmployeeId)
    : workEntries;

  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // For weekly view
  const weekDates = getCurrentWeekDates();
  
  const handleAddSubmit = (data: any) => {
    if (selectedEmployeeId) {
      addWorkEntry({
        employeeId: selectedEmployeeId,
        schoolId: data.schoolId,
        date: data.date.toISOString().split('T')[0],
        hours: data.hours,
        lastEditedBy: editorName,
        lastEditedAt: new Date().toISOString()
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSubmit = (data: any) => {
    if (currentEntry) {
      updateWorkEntry({
        id: currentEntry.id,
        employeeId: currentEntry.employeeId,
        schoolId: data.schoolId,
        date: data.date.toISOString().split('T')[0],
        hours: data.hours,
        lastEditedBy: currentEntry.lastEditedBy,
        lastEditedAt: currentEntry.lastEditedAt
      }, editorName);
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

  // Function to get the hours for a specific employee on a specific date
  const getHoursForDate = (employeeId: string, date: string) => {
    return workEntries
      .filter(entry => entry.employeeId === employeeId && entry.date === date)
      .map(entry => ({
        ...entry,
        schoolName: getSchoolById(entry.schoolId)?.name || "Desconocido"
      }));
  };

  // Format date for display
  const formatEditDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registro de Horas</h1>
          <p className="text-gray-600">Gestiona las horas trabajadas por los empleados</p>
        </div>
        {selectedEmployeeId && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Horas</span>
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
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
              <SelectItem value="all">Todos los empleados</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>

      {selectedEmployeeId && selectedEmployeeId !== "all" && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Horas este mes</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{getTotalHoursByEmployeeThisMonth(selectedEmployeeId)}</span>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Horas este año</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{getTotalHoursByEmployeeThisYear(selectedEmployeeId)}</span>
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Vista de Lista</TabsTrigger>
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
                              <span className="text-xs text-gray-500">
                                {getDayOfWeek(entry.date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{school?.name || "Desconocido"}</TableCell>
                          <TableCell>{entry.hours} horas</TableCell>
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
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
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
          {selectedEmployeeId && selectedEmployeeId !== "all" ? (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][index];
                const dayNumber = new Date(date).getDate();
                const entries = getHoursForDate(selectedEmployeeId, date);
                const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
                
                return (
                  <div key={date} className="flex flex-col">
                    <div className={`text-center p-2 rounded-t-md ${index === 0 || index === 6 ? 'bg-gray-200' : 'bg-company-blue text-white'}`}>
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
                                  <span className="text-xs text-gray-500">{entry.hours} horas</span>
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
                                setCurrentEntry({ employeeId: selectedEmployeeId, date });
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
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Selecciona un empleado para ver su horario semanal.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Hours Dialog */}
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
              employeeId: currentEntry.employeeId,
              schoolId: "",
              date: currentEntry.date,
              hours: 8
            } : undefined}
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setIsAddDialogOpen(false);
              if (currentEntry && currentEntry.date) {
                setCurrentEntry(null);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Hours Dialog */}
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
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
