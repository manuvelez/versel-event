import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const distancePricingSchema = z.object({
  distanceKm: z.number().min(1, "La distancia debe ser mayor a 0"),
  price: z.string().min(1, "El precio es requerido"),
});

type DistancePricingForm = z.infer<typeof distancePricingSchema>;

interface DistancePricing {
  id: number;
  providerId: number;
  distanceKm: number;
  price: string;
  createdAt: string;
}

export default function ProviderDistancePricing() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, using provider ID 1
  const providerId = 1;

  const form = useForm<DistancePricingForm>({
    resolver: zodResolver(distancePricingSchema),
    defaultValues: {
      distanceKm: 0,
      price: "",
    },
  });

  const editForm = useForm<DistancePricingForm>({
    resolver: zodResolver(distancePricingSchema),
    defaultValues: {
      distanceKm: 0,
      price: "",
    },
  });

  const { data: distancePricing = [], isLoading, error } = useQuery<DistancePricing[]>({
    queryKey: [`/api/providers/${providerId}/distance-pricing`],
  });



  const createMutation = useMutation({
    mutationFn: (data: DistancePricingForm) => 
      apiRequest("POST", `/api/providers/${providerId}/distance-pricing`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/distance-pricing`] });
      form.reset();
      toast({
        title: "Precio por distancia creado",
        description: "El precio por distancia se ha agregado correctamente.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating distance pricing:', error);
      toast({
        title: "Error",
        description: `No se pudo crear el precio por distancia: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DistancePricingForm }) =>
      apiRequest("PUT", `/api/distance-pricing/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/distance-pricing`] });
      setEditingId(null);
      editForm.reset();
      toast({
        title: "Precio actualizado",
        description: "El precio por distancia se ha actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio por distancia.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/distance-pricing/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/distance-pricing`] });
      toast({
        title: "Precio eliminado",
        description: "El precio por distancia se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el precio por distancia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DistancePricingForm) => {
    console.log('Form data before submission:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Is form valid:', form.formState.isValid);
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: DistancePricingForm) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    }
  };

  const startEdit = (pricing: DistancePricing) => {
    setEditingId(pricing.id);
    editForm.setValue("distanceKm", pricing.distanceKm);
    editForm.setValue("price", pricing.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error al cargar los datos</h2>
          <p className="text-slate-600">No se pudieron cargar los precios por distancia.</p>
          <pre className="mt-4 p-4 bg-red-50 text-red-700 rounded text-sm text-left max-w-md mx-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Precios por Distancia
          </h1>
          <p className="text-slate-600">
            Configura los precios de tus servicios según la distancia al lugar del evento
          </p>
        </div>

        {/* Create new distance pricing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Agregar Nuevo Precio por Distancia</span>
            </CardTitle>
            <CardDescription>
              Define el precio adicional por kilómetros de distancia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="distanceKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Distancia (km)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ej: 25"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Precio</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ej: 10000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {createMutation.isPending ? "Agregando..." : "Agregar Precio"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Distance pricing list */}
        <Card>
          <CardHeader>
            <CardTitle>Precios Configurados</CardTitle>
            <CardDescription>
              Gestiona tus precios por distancia existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {distancePricing && distancePricing.length > 0 ? (
              <div className="space-y-4">
                {distancePricing.map((pricing) => (
                  <div
                    key={pricing.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-slate-50"
                  >
                    {editingId === pricing.id ? (
                      <Form {...editForm}>
                        <form
                          onSubmit={editForm.handleSubmit(onEditSubmit)}
                          className="flex-1 flex items-center space-x-4"
                        >
                          <FormField
                            control={editForm.control}
                            name="distanceKm"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex space-x-2">
                            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                              Guardar
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span className="font-medium">{pricing.distanceKm} km</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-slate-500" />
                              <span className="text-green-600 font-semibold">
                                {formatPrice(pricing.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(pricing)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(pricing.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tienes precios por distancia configurados</p>
                <p className="text-sm">Agrega tu primer precio usando el formulario de arriba</p>
                <p className="text-xs mt-2 text-slate-400">
                  Datos cargados: {JSON.stringify(distancePricing)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}