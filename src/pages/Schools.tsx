
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolsList } from "@/components/schools/SchoolsList";
import { SchoolTeachers } from "@/components/schools/SchoolTeachers";
import { SchoolReports } from "@/components/schools/SchoolReports";
import { SchoolDialogs } from "@/components/schools/SchoolDialogs";
import { useSchoolData } from "@/hooks/useSchoolData";

const Schools = () => {
  const {
    schoolHours,
    expandedSchools,
    toggleSchoolExpand,
    openEditDialog,
    openDeleteDialog,
    hasWorkEntries,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentSchool,
    handleAddSubmit,
    handleEditSubmit,
    handleDelete,
    selectedMonth,
    setSelectedMonth,
    monthlyReportData
  } = useSchoolData();

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Colegios</h1>
          <p className="text-gray-600">Gestiona los colegios en el sistema</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar Colegio</span>
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista de Colegios</TabsTrigger>
          <TabsTrigger value="teachers">Profesores por Colegio</TabsTrigger>
          <TabsTrigger value="reports">Informes Mensuales</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <SchoolsList 
            schools={schoolHours}
            expandedSchools={expandedSchools}
            toggleSchoolExpand={toggleSchoolExpand}
            openEditDialog={openEditDialog}
            openDeleteDialog={openDeleteDialog}
            hasWorkEntries={hasWorkEntries}
          />
        </TabsContent>

        <TabsContent value="teachers">
          <SchoolTeachers schools={schoolHours} />
        </TabsContent>

        <TabsContent value="reports">
          <SchoolReports 
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            monthlyReportData={monthlyReportData}
          />
        </TabsContent>
      </Tabs>

      <SchoolDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        currentSchool={currentSchool}
        hasWorkEntries={hasWorkEntries}
        handleAddSubmit={handleAddSubmit}
        handleEditSubmit={handleEditSubmit}
        handleDelete={handleDelete}
      />
    </MainLayout>
  );
};

export default Schools;
