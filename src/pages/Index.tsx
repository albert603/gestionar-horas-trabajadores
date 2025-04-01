
import React from "react";
import { useApp } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, School, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/data";

const Dashboard = () => {
  const { employees, workEntries, schools } = useApp();
  const activeEmployees = employees.filter(e => e.active).length;
  const totalHours = workEntries.reduce((sum, entry) => sum + entry.hours, 0);
  
  // Recent entries (last 5)
  const recentEntries = [...workEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const today = new Date().toISOString().split('T')[0];
  const todayHours = workEntries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.hours, 0);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="text-lg font-medium">{entry.hours}h</div>
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

        <Card>
          <CardHeader>
            <CardTitle>Empleados Activos</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="space-y-4">
                {employees.slice(0, 5).map((employee) => {
                  const totalHours = workEntries
                    .filter(entry => entry.employeeId === employee.id)
                    .reduce((sum, entry) => sum + entry.hours, 0);
                  
                  return (
                    <div key={employee.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.position}</p>
                      </div>
                      <div className="text-lg font-medium">{totalHours}h</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay empleados registrados</div>
            )}
            <div className="mt-4 text-center">
              <Link to="/employees" className="text-company-blue hover:underline text-sm">
                Ver todos los empleados →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
