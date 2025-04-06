
import React from 'react';
import { Badge } from '../ui/badge';

interface UserInfoCardProps {
  position: string;
  message: string;
}

const UserInfoCard = ({ position, message }: UserInfoCardProps) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center mb-2">
        <Badge variant="outline" className="mr-2">
          {position}
        </Badge>
        <p className="text-sm text-gray-500">Usuario Regular</p>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default UserInfoCard;
