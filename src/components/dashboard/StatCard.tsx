
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  Icon: LucideIcon;
  bgColorClass: string;
  iconColorClass: string;
}

const StatCard = ({ title, value, Icon, bgColorClass, iconColorClass }: StatCardProps) => {
  return (
    <div className={`${bgColorClass} p-4 rounded-lg flex items-center`}>
      <div className={`rounded-full ${iconColorClass} p-3 mr-4`}>
        <Icon className={`h-6 w-6 ${iconColorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className={`text-sm ${iconColorClass.replace('bg-', 'text-')}`}>
          {title}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
