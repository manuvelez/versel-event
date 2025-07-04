import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { PaymentAlias } from "@shared/schema";

export default function PaymentRedirect() {
  const { alias } = useParams();
  const [paymentAlias, setPaymentAlias] = useState<PaymentAlias | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchPaymentAlias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment-aliases/by-alias/${alias}`);
        
        if (!response.ok) {
          throw new Error("Alias de pago no encontrado");
        }
        
        const data = await response.json();
        setPaymentAlias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (alias) {
      fetchPaymentAlias();
    }
  }, [alias]);

  const handleRedirect = () => {
    if (paymentAlias) {
      setRedirecting(true);
      window.open(paymentAlias.paymentUrl, "_blank");
      
      // Simulate redirect delay
      setTimeout(() => {
        setRedirecting(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Verificando enlace de pago...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentAlias) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Enlace no válido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error || `El alias de pago "${alias}" no existe o no está activo.`}
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-600">Enlace de pago válido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">{paymentAlias.displayName}</h2>
            {paymentAlias.description && (
              <p className="text-gray-600">{paymentAlias.description}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">Enlace de destino:</p>
            <p className="text-sm font-mono break-all text-gray-700">
              {paymentAlias.paymentUrl}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRedirect}
              disabled={redirecting}
              className="w-full"
              size="lg"
            >
              {redirecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirigiendo...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Proceder al pago
                </>
              )}
            </Button>

            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Al continuar, serás redirigido a una página externa para completar el pago.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}