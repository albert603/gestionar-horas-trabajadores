
import { useContext } from 'react';
import { CombinedContext } from './CombinedContextProvider';
import { AppContextType } from './AppContextType';

export const useApp = (): AppContextType => {
  const context = useContext(CombinedContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
