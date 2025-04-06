
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  infoTabContent: React.ReactNode;
  credentialsTabContent: React.ReactNode;
};

export function FormTabs({ 
  activeTab, 
  onTabChange, 
  infoTabContent, 
  credentialsTabContent 
}: FormTabsProps) {
  return (
    <Tabs defaultValue="info" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="credentials">Credenciales</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4 mt-4">
        {infoTabContent}
      </TabsContent>
      
      <TabsContent value="credentials" className="space-y-4 mt-4">
        {credentialsTabContent}
      </TabsContent>
    </Tabs>
  );
}
