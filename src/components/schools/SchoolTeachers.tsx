
import React from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SchoolTeachersProps {
  schools: any[];
}

export const SchoolTeachers = ({ schools }: SchoolTeachersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
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
  );
};
