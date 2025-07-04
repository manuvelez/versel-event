import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Edit, Trash2, Tag, Calendar as CalendarLucide } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Promotion, Service } from "@shared/schema";

const promotionSchema = z.object({
  serviceId: z.number(),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  discountPercentage: z.number().min(1).max(100),
  originalPrice: z.string().min(1, "El precio original es requerido"),
  promotionalPrice: z.string().min(1, "El precio promocional es requerido"),
  validFrom: z.date(),
  validUntil: z.date(),
  image: z.string().optional(),
});

type PromotionForm = z.infer<typeof promotionSchema>;

export default function ProviderPromotions() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  // Mock provider ID - en una aplicación real vendría del estado de autenticación
  const providerId = 1;

  const { data: services } = useQuery<Service[]>({
    queryKey: [`/api/providers/${providerId}/services`],
  });

  const { data: promotions } = useQuery<Promotion[]>({
    queryKey: [`/api/providers/${providerId}/promotions`],
  });

  const form = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      discountPercentage: 10,
    },
  });

  const createPromotion = useMutation({
    mutationFn: (data: PromotionForm) => apiRequest("/api/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/promotions`] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      setIsCreating(false);
      form.reset();
      toast({
        title: "Promoción creada",
        description: "La promoción se ha creado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la promoción",
        variant: "destructive",
      });
    },
  });

  const deletePromotion = useMutation({
    mutationFn: (promotionId: number) => apiRequest(`/api/promotions/${promotionId}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/promotions`] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      toast({
        title: "Promoción eliminada",
        description: "La promoción se ha eliminado exitosamente",
      });
    },
  });

  const onSubmit = (data: PromotionForm) => {
    createPromotion.mutate(data);
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculatePromotionalPrice = (original: string, discount: number) => {
    const originalPrice = parseFloat(original);
    const promotionalPrice = originalPrice - (originalPrice * discount / 100);
    return promotionalPrice.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Promociones
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Crea y gestiona promociones especiales para tus servicios
          </p>
        </div>

        {/* Crear nueva promoción */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Nueva Promoción
                </CardTitle>
                <CardDescription>
                  Configura descuentos especiales con fechas personalizadas
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsCreating(!isCreating)}
                variant={isCreating ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Cancelar" : "Crear Promoción"}
              </Button>
            </div>
          </CardHeader>

          {isCreating && (
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                              {services?.map((service) => (
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
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentaje de Descuento</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Porcentaje del 1% al 100%
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Promoción</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Oferta Especial de Navidad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe los detalles de la promoción..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Original</FormLabel>
                          <FormControl>
                            <Input placeholder="250000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Precio sin descuento en pesos colombianos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="promotionalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Promocional</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="200000"
                              {...field}
                              value={
                                form.watch("originalPrice") && form.watch("discountPercentage")
                                  ? calculatePromotionalPrice(
                                      form.watch("originalPrice"),
                                      form.watch("discountPercentage")
                                    )
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Se calcula automáticamente según el descuento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Fin</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  date < new Date() || 
                                  (form.watch("validFrom") && date <= form.watch("validFrom"))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Imagen (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/imagen.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL de una imagen para mostrar en la promoción
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createPromotion.isPending}>
                      {createPromotion.isPending ? "Creando..." : "Crear Promoción"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          )}
        </Card>

        {/* Lista de promociones existentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarLucide className="h-5 w-5" />
              Promociones Activas
            </CardTitle>
            <CardDescription>
              Gestiona tus promociones existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {promotions && promotions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promotion) => (
                  <Card key={promotion.id} className="relative">
                    {promotion.image && (
                      <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <img
                          src={promotion.image}
                          alt={promotion.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          -{promotion.discountPercentage}%
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {promotion.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePromotion.mutate(promotion.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {promotion.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(promotion.promotionalPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(promotion.originalPrice)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Desde: {format(new Date(promotion.validFrom), "PPP", { locale: es })}</div>
                          <div>Hasta: {format(new Date(promotion.validUntil), "PPP", { locale: es })}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay promociones
                </h3>
                <p className="text-gray-500 mb-4">
                  Crea tu primera promoción para aumentar las ventas
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Promoción
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}