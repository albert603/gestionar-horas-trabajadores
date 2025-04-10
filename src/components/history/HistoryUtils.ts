
import { HistoryLog } from "@/types";

export const filterHistoryLogs = (
  historyLogs: HistoryLog[],
  filterEntity: string,
  filterAction: string,
  searchTerm: string
): HistoryLog[] => {
  // Early return if the input isn't an array
  if (!Array.isArray(historyLogs)) {
    console.warn("filterHistoryLogs received non-array input:", historyLogs);
    return [];
  }
  
  return historyLogs.filter(log => {
    if (!log) return false;
    
    const matchesEntity = filterEntity === "all" || (log.entityType && log.entityType === filterEntity);
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesSearch = searchTerm === "" || 
                         (log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesEntity && matchesAction && matchesSearch;
  });
};
