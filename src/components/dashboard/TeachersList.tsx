
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CalendarIcon, Building2 } from "lucide-react";
import { Employee, WorkEntry } from '@/types';
import { formatDate } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeachersListProps {
  employees: Employee[];
  getSchoolById: (id: string) => { id: string; name: string } | undefined;
  getWorkEntriesByEmployeeAndDate: (employeeId: string, date: string) => WorkEntry[];
  getTotalHoursByEmployeeThisMonth: (employeeId: string) => number;
}

const TeachersList: React.FC<TeachersListProps> = ({
  employees,
  getSchoolById,
  getWorkEntriesByEmployeeAndDate,
  getTotalHoursByEmployeeThisMonth
}) => {
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Filter only active employees
  const activeEmployees = employees.filter(emp => emp.active);
  
  // Get current month and year for filtering
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthStr = now.toLocaleString('es-ES', { month: 'long' });
  
  const toggleTeacherDetails = (teacherId: string) => {
    if (expandedTeacher === teacherId) {
      setExpandedTeacher(null);
    } else {
      setExpandedTeacher(teacherId);
    }
  };
  
  // Generate dates for the current month
  const getDatesInCurrentMonth = () => {
    const dates = [];
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(currentYear, currentMonth, i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const currentMonthDates = getDatesInCurrentMonth();
  
  // Format date for API queries
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  return (
    <Card className="w-full mt-4">
      <CardHeader className={isMobile ? "p-4" : "p-6"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Profesores Activos
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "p-4" : "p-6"}>
        {activeEmployees.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No hay profesores activos
          </div>
        ) : (
          <div className="space-y-4">
            {activeEmployees.map((teacher) => (
              <div key={teacher.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleTeacherDetails(teacher.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.position}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <div className="font-medium">{getTotalHoursByEmployeeThisMonth(teacher.id)}h</div>
                      <div className="text-xs text-gray-500">este mes</div>
                    </div>
                    {expandedTeacher === teacher.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedTeacher === teacher.id && (
                  <div className="p-4 bg-white">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" /> 
                      Actividad en {currentMonthStr}
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Colegio</TableHead>
                            <TableHead>Horas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentMonthDates.map((date) => {
                            const formattedDate = formatDateForApi(date);
                            const entries = getWorkEntriesByEmployeeAndDate(teacher.id, formattedDate);
                            
                            if (entries.length === 0) return null;
                            
                            return entries.map((entry, entryIndex) => (
                              <TableRow key={`${formattedDate}-${entryIndex}`}>
                                {entryIndex === 0 && (
                                  <TableCell>
                                    {formatDate(date)}
                                  </TableCell>
                                )}
                                {entryIndex > 0 && <TableCell />}
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    {getSchoolById(entry.schoolId)?.name || "Desconocido"}
                                  </div>
                                </TableCell>
                                <TableCell>{entry.hours}h</TableCell>
                              </TableRow>
                            ));
                          })}
                          {!currentMonthDates.some(date => 
                            getWorkEntriesByEmployeeAndDate(teacher.id, formatDateForApi(date)).length > 0
                          ) && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500">
                                No hay registros para este mes
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeachersList;
