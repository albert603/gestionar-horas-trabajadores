
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Position } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';

interface PositionContextType {
  positions: Position[];
  addPosition: (position: Omit<Position, "id">) => void;
  updatePosition: (position: Position) => void;
  deletePosition: (id: string) => void;
}

const PositionContext = createContext<PositionContextType | undefined>(undefined);

export const PositionProvider: React.FC<{ 
  children: React.ReactNode;
  initialPositions: Position[];
}> = ({ children, initialPositions }) => {
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const addHistoryLog = useAddHistoryLog();

  const addPosition = (position: Omit<Position, "id">) => {
    const newPosition: Position = {
      ...position,
      id: uuidv4()
    };
    setPositions(prev => [...prev, newPosition]);
    addHistoryLog("Añadir", `Se añadió el cargo ${newPosition.name}`);
  };

  const updatePosition = (position: Position) => {
    setPositions(prev => 
      prev.map(p => p.id === position.id ? position : p)
    );
    addHistoryLog("Actualizar", `Se actualizó el cargo ${position.name}`);
  };

  const deletePosition = (id: string) => {
    const position = positions.find(p => p.id === id);
    setPositions(prev => prev.filter(p => p.id !== id));
    addHistoryLog("Eliminar", `Se eliminó el cargo ${position?.name || id}`);
  };

  const positionContextValue: PositionContextType = {
    positions,
    addPosition,
    updatePosition,
    deletePosition
  };

  return (
    <PositionContext.Provider value={positionContextValue}>
      {children}
    </PositionContext.Provider>
  );
};

export const usePosition = () => {
  const context = useContext(PositionContext);
  if (context === undefined) {
    throw new Error('usePosition must be used within a PositionProvider');
  }
  return context;
};
