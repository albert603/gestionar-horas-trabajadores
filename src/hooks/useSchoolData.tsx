
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { School } from "@/types";

export const useSchoolData = () => {
  const { 
    schools, 
    employees,
    workEntries, 
    addSchool, 
    updateSchool, 
    deleteSchool,
    deleteSchoolAndResetHours, 
    getTotalHoursBySchoolThisMonth,
    getEmployeeById,
    getEmployeesBySchool
  } = useApp();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth() + "-" + new Date().getFullYear()
  );
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({});

  const schoolHours = schools.map(school => {
    const entries = workEntries.filter(entry => entry.schoolId === school.id);
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const monthlyHours = getTotalHoursBySchoolThisMonth(school.id);
    
    const schoolEmployees = getEmployeesBySchool(school.id);
    
    return {
      ...school,
      totalHours,
      monthlyHours,
      entries: entries.length,
      employees: schoolEmployees
    };
  });

  const handleAddSubmit = (data: { name: string }) => {
    try {
      addSchool({
        name: data.name
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Colegio añadido",
        description: `El colegio ${data.name} se ha añadido correctamente.`,
      });
    } catch (error) {
      console.error("Error al añadir colegio:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al añadir el colegio.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = (data: { name: string }) => {
    try {
      if (currentSchool) {
        updateSchool({
          id: currentSchool.id,
          name: data.name
        });
        toast({
          title: "Colegio actualizado",
          description: `El colegio se ha actualizado correctamente.`,
        });
      }
      setIsEditDialogOpen(false);
      setCurrentSchool(null);
    } catch (error) {
      console.error("Error al actualizar colegio:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el colegio.",
        variant: "destructive",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = () => {
    try {
      if (currentSchool) {
        const result = deleteSchool(currentSchool.id);
        if (result) {
          toast({
            title: "Colegio eliminado",
            description: "El colegio se ha eliminado correctamente.",
          });
        } else {
          toast({
            title: "No se puede eliminar",
            description: "Este colegio tiene registros de horas asociados. Use la opción 'Eliminar y restablecer'.",
            variant: "destructive",
          });
          setIsDeleteDialogOpen(false);
          setIsForceDeleteDialogOpen(true);
          return;
        }
      }
      setIsDeleteDialogOpen(false);
      setCurrentSchool(null);
    } catch (error) {
      console.error("Error al eliminar colegio:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el colegio.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const handleForceDelete = () => {
    try {
      if (currentSchool) {
        deleteSchoolAndResetHours(currentSchool.id);
        toast({
          title: "Colegio eliminado",
          description: "El colegio y todos sus registros asociados han sido eliminados.",
        });
      }
      setIsForceDeleteDialogOpen(false);
      setCurrentSchool(null);
    } catch (error) {
      console.error("Error al eliminar colegio y restablecer horas:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el colegio y sus registros.",
        variant: "destructive",
      });
      setIsForceDeleteDialogOpen(false);
      setCurrentSchool(null);
    }
  };

  const openEditDialog = (school: School) => {
    setCurrentSchool(school);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (school: School) => {
    setCurrentSchool(school);
    setIsDeleteDialogOpen(true);
  };

  const openForceDeleteDialog = (school: School) => {
    setCurrentSchool(school);
    setIsForceDeleteDialogOpen(true);
  };

  const toggleSchoolExpand = (schoolId: string) => {
    setExpandedSchools(prev => ({
      ...prev,
      [schoolId]: !prev[schoolId]
    }));
  };

  const hasWorkEntries = (schoolId: string) => {
    return workEntries.some(entry => entry.schoolId === schoolId);
  };

  const getMonthlyReportData = () => {
    if (!selectedMonth) return [];
    
    const [monthStr, yearStr] = selectedMonth.split("-");
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const filteredEntries = workEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= startDate && 
        entryDate <= endDate
      );
    });
    
    const schoolReport: Record<string, any> = {};
    
    filteredEntries.forEach(entry => {
      if (!schoolReport[entry.schoolId]) {
        const school = schools.find(s => s.id === entry.schoolId);
        schoolReport[entry.schoolId] = {
          schoolName: school ? school.name : "Desconocido",
          employees: {},
          totalHours: 0
        };
      }
      
      if (!schoolReport[entry.schoolId].employees[entry.employeeId]) {
        const employee = getEmployeeById(entry.employeeId);
        schoolReport[entry.schoolId].employees[entry.employeeId] = {
          employeeName: employee ? employee.name : "Desconocido",
          hours: 0
        };
      }
      
      schoolReport[entry.schoolId].employees[entry.employeeId].hours += entry.hours;
      schoolReport[entry.schoolId].totalHours += entry.hours;
    });
    
    return Object.values(schoolReport);
  };

  const monthlyReportData = getMonthlyReportData();

  return {
    schoolHours,
    expandedSchools,
    toggleSchoolExpand,
    openEditDialog,
    openDeleteDialog,
    openForceDeleteDialog,
    hasWorkEntries,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isForceDeleteDialogOpen,
    setIsForceDeleteDialogOpen,
    currentSchool,
    handleAddSubmit,
    handleEditSubmit,
    handleDelete,
    handleForceDelete,
    selectedMonth,
    setSelectedMonth,
    monthlyReportData
  };
};
