import React, { useState, useEffect } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setError(event.error);
    };
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      setError(event.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (error) {
    let errorMessage = "Algo salió mal. Por favor, intenta recargar la página.";
    let isPermissionError = false;

    try {
      const errorData = JSON.parse(error.message || '{}');
      if (errorData.error?.includes('permission-denied') || errorData.error?.includes('Missing or insufficient permissions')) {
        isPermissionError = true;
        errorMessage = "No tienes permisos suficientes para realizar esta acción o ver estos datos.";
      }
    } catch (e) {
      // Not a JSON error message
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              {isPermissionError ? (
                <Lock className="w-8 h-8 text-destructive" />
              ) : (
                <AlertCircle className="w-8 h-8 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isPermissionError ? 'Acceso Denegado' : 'Error Inesperado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary"
            >
              Recargar Aplicación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
