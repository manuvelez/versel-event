import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Edit, Trash2, Settings, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertPackageSchema, insertPackageServiceSchema } from "@shared/schema";
import type { Package as PackageType, PackageService, Service } from "@shared/schema";

const packageFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  basePrice: z.string().min(1, "El precio base es requerido"),
  packageType: z.string().min(1, "El tipo de paquete es requerido"),
  active: z.boolean().default(true)
});

const packageServiceFormSchema = z.object({
  serviceId: z.number().min(1, "Selecciona un servicio"),
  included: z.boolean().default(false),
  additionalPrice: z.string().min(1, "El precio adicional es requerido")
});

type PackageForm = z.infer<typeof packageFormSchema>;
type PackageServiceForm = z.infer<typeof packageServiceFormSchema>;

interface PackageWithServices extends PackageType {
  services?: (PackageService & { service?: Service })[];
}

export default function ProviderPackages() {
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<PackageWithServices | null>(null);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [isManagingServices, setIsManagingServices] = useState(false);

  // Fetch packages for current provider (hardcoded as provider 1 for demo)
  const { data: packages = [], isLoading: packagesLoading } = useQuery<PackageWithServices[]>({
    queryKey: ["/api/providers/1/packages"],
  });

  // Fetch available services for adding to packages
  const { data: availableServices = [] } = useQuery<Service[]>({
    queryKey: ["/api/providers/1/services"],
  });

  // Fetch package services when a package is selected
  const { data: packageServices = [] } = useQuery<PackageService[]>({
    queryKey: ["/api/packages", selectedPackage?.id, "services"],
    enabled: !!selectedPackage?.id,
  });

  // Package mutations
  const createPackageMutation = useMutation({
    mutationFn: (data: PackageForm) => 
      apiRequest("POST", "/api/providers/1/packages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers/1/packages"] });
      setIsEditingPackage(false);
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PackageForm> }) =>
      apiRequest("PUT", `/api/packages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers/1/packages"] });
      setIsEditingPackage(false);
      setSelectedPackage(null);
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers/1/packages"] });
      setSelectedPackage(null);
    },
  });

  // Package service mutations
  const addServiceMutation = useMutation({
    mutationFn: (data: PackageServiceForm) =>
      apiRequest("POST", `/api/packages/${selectedPackage?.id}/services`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages", selectedPackage?.id, "services"] });
    },
  });

  const removeServiceMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/package-services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages", selectedPackage?.id, "services"] });
    },
  });

  // Forms
  const packageForm = useForm<PackageForm>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      packageType: "customizable",
      active: true,
    },
  });

  const serviceForm = useForm<PackageServiceForm>({
    resolver: zodResolver(packageServiceFormSchema),
    defaultValues: {
      serviceId: 0,
      included: false,
      additionalPrice: "0",
    },
  });

  const onPackageSubmit = (data: PackageForm) => {
    if (selectedPackage && isEditingPackage) {
      updatePackageMutation.mutate({ id: selectedPackage.id, data });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  const onServiceSubmit = (data: PackageServiceForm) => {
    addServiceMutation.mutate(data);
    serviceForm.reset();
  };

  const startEditPackage = (pkg: PackageWithServices) => {
    setSelectedPackage(pkg);
    setIsEditingPackage(true);
    packageForm.reset({
      name: pkg.name,
      description: pkg.description || "",
      basePrice: pkg.basePrice,
      packageType: pkg.packageType,
      active: pkg.active ?? true,
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  if (packagesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando paquetes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Gestión de Paquetes
          </h1>
          <p className="text-gray-600 mt-2">
            Crea y gestiona paquetes personalizables para tus servicios
          </p>
        </div>
        
        <Dialog open={isEditingPackage} onOpenChange={setIsEditingPackage}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedPackage(null);
              packageForm.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paquete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedPackage ? "Editar Paquete" : "Crear Nuevo Paquete"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...packageForm}>
              <form onSubmit={packageForm.handleSubmit(onPackageSubmit)} className="space-y-4">
                <FormField
                  control={packageForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Paquete</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Paquete Premium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={packageForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe lo que incluye este paquete..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={packageForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Base (COP)</FormLabel>
                      <FormControl>
                        <Input placeholder="250000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={packageForm.control}
                  name="packageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Paquete</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customizable">Personalizable</SelectItem>
                          <SelectItem value="all_inclusive">Todo Incluido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={packageForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Paquete Activo</FormLabel>
                        <div className="text-sm text-gray-600">
                          Los clientes pueden ver y contratar este paquete
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                    className="flex-1"
                  >
                    {createPackageMutation.isPending || updatePackageMutation.isPending
                      ? "Guardando..." 
                      : selectedPackage ? "Actualizar" : "Crear Paquete"
                    }
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditingPackage(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes paquetes creados</h3>
            <p className="text-gray-600 text-center mb-4">
              Crea tu primer paquete para ofrecer combos de servicios a tus clientes
            </p>
            <Button onClick={() => setIsEditingPackage(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Paquete
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {pkg.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditPackage(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIsManagingServices(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(`/packages/${pkg.id}/customize`, '_blank')}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePackageMutation.mutate(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precio Base:</span>
                    <span className="font-semibold text-lg">
                      {formatPrice(pkg.basePrice)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge variant={pkg.packageType === 'customizable' ? 'default' : 'secondary'}>
                      {pkg.packageType === 'customizable' ? 'Personalizable' : 'Todo Incluido'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge variant={pkg.active ? 'default' : 'secondary'} className="flex items-center gap-1">
                      {pkg.active ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactivo
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Package Services Management Dialog */}
      <Dialog open={isManagingServices} onOpenChange={setIsManagingServices}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gestionar Servicios - {selectedPackage?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="included" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="included">Servicios Incluidos</TabsTrigger>
              <TabsTrigger value="add">Agregar Servicio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="included" className="space-y-4">
              {packageServices.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Este paquete no tiene servicios configurados aún.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {packageServices.map((ps) => (
                    <Card key={ps.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Servicio ID: {ps.serviceId}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant={ps.included ? 'default' : 'secondary'}>
                                {ps.included ? 'Incluido' : 'Opcional'}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Precio adicional: {formatPrice(ps.additionalPrice || "0")}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeServiceMutation.mutate(ps.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                  <FormField
                    control={serviceForm.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicio</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                {service.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={serviceForm.control}
                    name="included"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Incluido en el paquete</FormLabel>
                          <div className="text-sm text-gray-600">
                            ¿Este servicio está incluido sin costo adicional?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={serviceForm.control}
                    name="additionalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Adicional (COP)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0 si está incluido"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={addServiceMutation.isPending}
                    className="w-full"
                  >
                    {addServiceMutation.isPending ? "Agregando..." : "Agregar Servicio"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}