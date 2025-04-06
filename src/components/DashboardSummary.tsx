
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Building2, User, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const DashboardSummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    currentUser, 
    isAuthenticated,
    employees,
    schools,
    workEntries
  } = useApp();
  
  const isAdmin = currentUser?.role === 'Administrador';
  const currentUserName = currentUser?.name || '';
  const currentUserPosition = currentUser?.position || '';

  // Calculate counts from context data
  const employeesCount = employees.length;
  const schoolsCount = schools.length;
  
  // Calculate total hours
  const hoursCount = workEntries.reduce((total, entry) => total + entry.hours, 0);
  
  // For regular users, filter to show only their data
  const userSchoolsCount = isAdmin 
    ? schoolsCount 
    : (currentUser 
        ? schools.filter(school => 
            workEntries.some(entry => 
              entry.schoolId === school.id && entry.employeeId === currentUser.id
            )
          ).length 
        : 0);
  
  const userHoursCount = isAdmin
    ? hoursCount
    : (currentUser
        ? workEntries
            .filter(entry => entry.employeeId === currentUser.id)
            .reduce((total, entry) => total + entry.hours, 0)
        : 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isAdmin ? 'Resumen del Sistema' : 'Mi Panel'}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? 'Vista general de empleados, colegios y horas registradas' 
            : `Bienvenido, ${currentUserName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isAdmin && (
              <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <User className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Empleados</p>
                  <p className="text-2xl font-bold">{employeesCount}</p>
                </div>
              </div>
            )}
            
            <div className="bg-green-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Building2 className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700">
                  {isAdmin ? 'Colegios' : 'Mis Colegios'}
                </p>
                <p className="text-2xl font-bold">{isAdmin ? schoolsCount : userSchoolsCount}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700">
                  {isAdmin ? 'Total Horas' : 'Mis Horas'}
                </p>
                <p className="text-2xl font-bold">{isAdmin ? hoursCount : userHoursCount}</p>
              </div>
            </div>
          </div>
        )}
        
        {!isAdmin && !isLoading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="mr-2">
                {currentUserPosition}
              </Badge>
              <p className="text-sm text-gray-500">Usuario Regular</p>
            </div>
            <p className="text-sm">
              Bienvenido a tu panel de control. Aquí podrás ver tus colegios asignados y registrar tus horas trabajadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
