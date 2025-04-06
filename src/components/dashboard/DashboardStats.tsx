
import React from 'react';
import { Building2, User, Clock } from 'lucide-react';
import StatCard from './StatCard';

interface DashboardStatsProps {
  isAdmin: boolean;
  employeesCount: number;
  schoolsCount: number;
  userSchoolsCount: number;
  hoursCount: number;
  userHoursCount: number;
}

const DashboardStats = ({
  isAdmin,
  employeesCount,
  schoolsCount,
  userSchoolsCount,
  hoursCount,
  userHoursCount
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {isAdmin && (
        <StatCard
          title="Empleados"
          value={employeesCount}
          Icon={User}
          bgColorClass="bg-blue-50"
          iconColorClass="bg-blue-100"
        />
      )}
      
      <StatCard
        title={isAdmin ? 'Colegios' : 'Mis Colegios'}
        value={isAdmin ? schoolsCount : userSchoolsCount}
        Icon={Building2}
        bgColorClass="bg-green-50"
        iconColorClass="bg-green-100"
      />
      
      <StatCard
        title={isAdmin ? 'Total Horas' : 'Mis Horas'}
        value={isAdmin ? hoursCount : userHoursCount}
        Icon={Clock}
        bgColorClass="bg-purple-50"
        iconColorClass="bg-purple-100"
      />
    </div>
  );
};

export default DashboardStats;
