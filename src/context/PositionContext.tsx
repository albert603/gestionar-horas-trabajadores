
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Position } from '@/types';
import { useAddHistoryLog } from '@/hooks/useHistoryLog';
import { fetchPositions, insertPosition, updatePositionData, deletePositionData } from './position/positionApi';
import { toast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const addHistoryLog = useAddHistoryLog();

  // Cargar posiciones desde Supabase al iniciar
  useEffect(() => {
    const loadPositions = async () => {
      try {
        setIsLoading(true);
        const dbPositions = await fetchPositions();
        setPositions(dbPositions);
      } catch (error) {
        console.error("Error loading positions:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cargos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPositions();
  }, []);

  const addPosition = async (position: Omit<Position, "id">) => {
    try {
      const newPosition = await insertPosition(position);
      setPositions(prev => [...prev, newPosition]);
      addHistoryLog("Añadir", `Se añadió el cargo ${newPosition.name}`);
      toast({
        title: "Éxito",
        description: `Cargo "${position.name}" añadido correctamente`,
      });
    } catch (error) {
      console.error("Error adding position:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el cargo",
        variant: "destructive"
      });
    }
  };

  const updatePosition = async (position: Position) => {
    try {
      await updatePositionData(position);
      setPositions(prev => 
        prev.map(p => p.id === position.id ? position : p)
      );
      addHistoryLog("Actualizar", `Se actualizó el cargo ${position.name}`);
      toast({
        title: "Éxito",
        description: `Cargo "${position.name}" actualizado correctamente`,
      });
    } catch (error) {
      console.error("Error updating position:", error);
      toast({
        title: "Error", 
        description: "No se pudo actualizar el cargo", 
        variant: "destructive"
      });
    }
  };

  const deletePosition = async (id: string) => {
    try {
      const position = positions.find(p => p.id === id);
      await deletePositionData(id);
      setPositions(prev => prev.filter(p => p.id !== id));
      addHistoryLog("Eliminar", `Se eliminó el cargo ${position?.name || id}`);
      toast({
        title: "Éxito",
        description: `Cargo eliminado correctamente`,
      });
    } catch (error) {
      console.error("Error deleting position:", error);
      toast({
        title: "Error", 
        description: "No se pudo eliminar el cargo", 
        variant: "destructive"
      });
    }
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
