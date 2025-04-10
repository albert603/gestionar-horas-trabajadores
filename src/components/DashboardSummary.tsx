
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useApp } from '@/context/AppContext';
import DashboardStats from './dashboard/DashboardStats';
import UserInfoCard from './dashboard/UserInfoCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const DashboardSummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    currentUser, 
    isAuthenticated,
    employees,
    schools,
    workEntries
  } = useApp();
  
  const isMobile = useIsMobile();
  const isAdmin = currentUser?.role === 'Administrador';
  const currentUserName = currentUser?.name || '';
  const currentUserPosition = currentUser?.position || '';

  // Calculate counts from context data
  const employeesCount = employees.length;
  const activeEmployeesCount = employees.filter(emp => emp.active).length;
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

  const welcomeMessage = isMobile 
    ? "Registra tus horas trabajadas." 
    : "Bienvenido a tu panel de control. Aquí podrás ver tus colegios asignados y registrar tus horas trabajadas.";

  return (
    <Card className="w-full">
      <CardHeader className={isMobile ? "p-4" : "p-6"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          {isAdmin ? 'Resumen del Sistema' : 'Mi Panel'}
        </CardTitle>
        <CardDescription className={isMobile ? "text-sm" : ""}>
          {isAdmin 
            ? 'Vista general de empleados, colegios y horas registradas' 
            : `Bienvenido, ${currentUserName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", isMobile && "p-4")}>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <DashboardStats
            isAdmin={isAdmin}
            employeesCount={employeesCount}
            activeEmployeesCount={activeEmployeesCount}
            schoolsCount={schoolsCount}
            userSchoolsCount={userSchoolsCount}
            hoursCount={hoursCount}
            userHoursCount={userHoursCount}
          />
        )}
        
        {!isAdmin && !isLoading && (
          <UserInfoCard 
            position={currentUserPosition}
            message={welcomeMessage}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
