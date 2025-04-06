
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Check, X } from 'lucide-react';

const SupabaseTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Probar la conexión obteniendo los empleados
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*');
      
      if (employeesError) {
        throw new Error(`Error al obtener empleados: ${employeesError.message}`);
      }
      
      // Probar obteniendo las escuelas
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) {
        throw new Error(`Error al obtener escuelas: ${schoolsError.message}`);
      }
      
      // Si llegamos aquí, la conexión fue exitosa
      setIsConnected(true);
      setEmployeesCount(employees?.length || 0);
      setSchoolsCount(schools?.length || 0);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Error al conectar con Supabase');
      console.error('Error de conexión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Prueba de Conexión a Supabase</CardTitle>
        <CardDescription>
          Verifica si la aplicación puede comunicarse con la base de datos en Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {isConnected === null ? (
            <Badge variant="outline" className="px-4 py-2">
              No probado
            </Badge>
          ) : isConnected ? (
            <Badge variant="success" className="bg-green-100 text-green-800 px-4 py-2 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-4 py-2 flex items-center gap-2">
              <X className="h-4 w-4" />
              No conectado
            </Badge>
          )}
        </div>
        
        {isConnected && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-center">Datos encontrados:</p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                Empleados: {employeesCount}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Colegios: {schoolsCount}
              </Badge>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testConnection} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando...
            </>
          ) : (
            'Probar Conexión'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseTest;
