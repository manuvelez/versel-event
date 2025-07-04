import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, CheckCircle, XCircle, Plus, Minus, ShoppingCart, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Package as PackageType, PackageService, Service } from "@shared/schema";

interface PackageWithServices extends PackageType {
  services?: (PackageService & { service?: Service })[];
}

interface CustomizationState {
  [serviceId: number]: {
    selected: boolean;
    included: boolean;
    additionalPrice: string;
  };
}

export default function PackageCustomization() {
  const [, params] = useRoute("/packages/:id/customize");
  const packageId = params?.id ? parseInt(params.id) : null;
  const queryClient = useQueryClient();
  
  const [customization, setCustomization] = useState<CustomizationState>({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch package details
  const { data: packageData, isLoading: packageLoading } = useQuery<PackageType>({
    queryKey: ["/api/packages", packageId],
    enabled: !!packageId,
  });

  // Fetch package services
  const { data: packageServices = [], isLoading: servicesLoading } = useQuery<(PackageService & { service?: Service })[]>({
    queryKey: ["/api/packages", packageId, "services"],
    enabled: !!packageId,
  });

  // Initialize customization state when package services load
  useEffect(() => {
    if (packageServices.length > 0 && Object.keys(customization).length === 0) {
      const initialCustomization: CustomizationState = {};
      
      packageServices.forEach((ps) => {
        initialCustomization[ps.serviceId] = {
          selected: ps.included || false,
          included: ps.included || false,
          additionalPrice: ps.additionalPrice || "0"
        };
      });
      
      setCustomization(initialCustomization);
    }
  }, [packageServices]);

  // Calculate total price when customization changes
  useEffect(() => {
    if (packageData && Object.keys(customization).length > 0) {
      let total = parseInt(packageData.basePrice);
      
      Object.entries(customization).forEach(([serviceId, config]) => {
        if (config.selected && !config.included) {
          total += parseInt(config.additionalPrice);
        }
      });
      
      setTotalPrice(total);
    }
  }, [packageData, customization]);

  const handleServiceToggle = (serviceId: number, isIncluded: boolean) => {
    setCustomization(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        selected: !prev[serviceId]?.selected
      }
    }));
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  if (packageLoading || servicesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando paquete...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            No se pudo cargar la información del paquete.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{packageData.name}</h1>
            <p className="text-gray-600 mt-1">{packageData.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {packageData.packageType === 'customizable' ? 'Personalizable' : 'Todo Incluido'}
          </Badge>
          <span className="text-sm text-gray-600">
            Precio base: {formatPrice(packageData.basePrice)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Selecciona los Servicios que Necesitas
              </CardTitle>
              <CardDescription>
                Algunos salones de fiestas incluyen sus propios proveedores. 
                Selecciona solo los servicios que realmente necesitas contratar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {packageServices.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Este paquete no tiene servicios configurados aún.
                  </AlertDescription>
                </Alert>
              ) : (
                packageServices.map((ps) => {
                  const service = ps.service;
                  const config = customization[ps.serviceId] || { selected: false, included: false, additionalPrice: "0" };
                  const isIncluded = config.included;
                  const isSelected = config.selected;
                  
                  return (
                    <div key={ps.serviceId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleServiceToggle(ps.serviceId, isIncluded)}
                            disabled={isIncluded}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {service?.title || `Servicio ${ps.serviceId}`}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {service?.description || "Descripción del servicio"}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-3">
                              {isIncluded ? (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Incluido en el paquete
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Servicio opcional
                                </Badge>
                              )}
                              
                              {!isIncluded && (
                                <span className="text-sm font-medium text-green-600">
                                  + {formatPrice(ps.additionalPrice || "0")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumen del Paquete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio base del paquete:</span>
                  <span className="font-medium">{formatPrice(packageData.basePrice)}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Servicios seleccionados:</h4>
                  {Object.entries(customization).map(([serviceId, config]) => {
                    if (!config.selected) return null;
                    
                    const ps = packageServices.find(s => s.serviceId === parseInt(serviceId));
                    const service = ps?.service;
                    
                    return (
                      <div key={serviceId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {service?.title || `Servicio ${serviceId}`}
                        </span>
                        <span className={config.included ? "text-green-600" : "text-blue-600"}>
                          {config.included ? "Incluido" : formatPrice(config.additionalPrice)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {Object.values(customization).every(config => !config.selected) && (
                    <p className="text-sm text-gray-500 italic">
                      No hay servicios seleccionados
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(totalPrice)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={Object.values(customization).every(config => !config.selected)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Solicitar Cotización
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  * Los precios son aproximados y pueden variar según requerimientos específicos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}