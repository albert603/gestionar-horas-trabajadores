
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type ValidationAlertProps = {
  message: string | null;
};

export function ValidationAlert({ message }: ValidationAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error de validación</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
