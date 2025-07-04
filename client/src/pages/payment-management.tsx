import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PaymentAlias, SubscriptionPlan } from "@shared/schema";

const aliasFormSchema = z.object({
  alias: z.string().min(1, "El alias es requerido").max(50, "Máximo 50 caracteres"),
  displayName: z.string().min(1, "El nombre para mostrar es requerido"),
  paymentUrl: z.string().url("Debe ser una URL válida"),
  description: z.string().optional(),
});

const planFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.string().min(1, "El precio es requerido"),
  currency: z.string().default("ARS"),
  interval: z.enum(["monthly", "yearly"]),
  features: z.string().transform(str => str.split(",").map(f => f.trim()).filter(Boolean)),
});

type AliasForm = z.infer<typeof aliasFormSchema>;
type PlanForm = z.infer<typeof planFormSchema>;

export default function PaymentManagement() {
  const [editingAlias, setEditingAlias] = useState<PaymentAlias | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin (in a real app, this would come from authentication context)
  const isAdmin = true; // For demo purposes, assume admin access
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo el administrador principal puede acceder a la gestión de pagos.</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { data: aliases = [], isLoading: aliasesLoading } = useQuery<PaymentAlias[]>({
    queryKey: ["/api/payment-aliases"],
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const aliasForm = useForm<AliasForm>({
    resolver: zodResolver(aliasFormSchema),
    defaultValues: {
      alias: "",
      displayName: "",
      paymentUrl: "",
      description: "",
    },
  });

  const planForm = useForm<PlanForm>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      currency: "ARS",
      interval: "monthly",
      features: [],
    },
  });

  const createAliasMutation = useMutation({
    mutationFn: (data: AliasForm) => apiRequest("/api/payment-aliases", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-aliases"] });
      aliasForm.reset();
      toast({ title: "Alias de pago creado exitosamente" });
    },
  });

  const updateAliasMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AliasForm }) =>
      apiRequest(`/api/payment-aliases/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-aliases"] });
      setEditingAlias(null);
      aliasForm.reset();
      toast({ title: "Alias de pago actualizado exitosamente" });
    },
  });

  const deleteAliasMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/payment-aliases/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-aliases"] });
      toast({ title: "Alias de pago eliminado exitosamente" });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: PlanForm) => apiRequest("/api/subscription-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      planForm.reset();
      toast({ title: "Plan de suscripción creado exitosamente" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlanForm }) =>
      apiRequest(`/api/subscription-plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      setEditingPlan(null);
      planForm.reset();
      toast({ title: "Plan de suscripción actualizado exitosamente" });
    },
  });

  const onAliasSubmit = (data: AliasForm) => {
    if (editingAlias) {
      updateAliasMutation.mutate({ id: editingAlias.id, data });
    } else {
      createAliasMutation.mutate(data);
    }
  };

  const onPlanSubmit = (data: PlanForm) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const startEditAlias = (alias: PaymentAlias) => {
    setEditingAlias(alias);
    aliasForm.reset({
      alias: alias.alias,
      displayName: alias.displayName,
      paymentUrl: alias.paymentUrl,
      description: alias.description || "",
    });
  };

  const startEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    planForm.reset({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval as "monthly" | "yearly",
      features: plan.features || [],
    });
  };

  const copyPaymentLink = (alias: string) => {
    const link = `${window.location.origin}/pay/${alias}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Enlace copiado al portapapeles" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Pagos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alias de Pago */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingAlias ? "Editar Alias de Pago" : "Crear Alias de Pago"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={aliasForm.handleSubmit(onAliasSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Alias</label>
                  <Input
                    {...aliasForm.register("alias")}
                    placeholder="plan-basico"
                  />
                  {aliasForm.formState.errors.alias && (
                    <p className="text-sm text-red-600 mt-1">
                      {aliasForm.formState.errors.alias.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre para mostrar</label>
                  <Input
                    {...aliasForm.register("displayName")}
                    placeholder="Plan Básico"
                  />
                  {aliasForm.formState.errors.displayName && (
                    <p className="text-sm text-red-600 mt-1">
                      {aliasForm.formState.errors.displayName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">URL de Pago</label>
                  <Input
                    {...aliasForm.register("paymentUrl")}
                    placeholder="https://mercadopago.com/..."
                  />
                  {aliasForm.formState.errors.paymentUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {aliasForm.formState.errors.paymentUrl.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    {...aliasForm.register("description")}
                    placeholder="Descripción del plan..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createAliasMutation.isPending || updateAliasMutation.isPending}
                  >
                    {editingAlias ? "Actualizar" : "Crear"} Alias
                  </Button>
                  {editingAlias && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingAlias(null);
                        aliasForm.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alias de Pago Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {aliasesLoading ? (
                <p>Cargando aliases...</p>
              ) : aliases.length === 0 ? (
                <p className="text-gray-500">No hay aliases de pago configurados</p>
              ) : (
                <div className="space-y-4">
                  {aliases.map((alias) => (
                    <div key={alias.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{alias.displayName}</h3>
                          <p className="text-sm text-gray-600">/{alias.alias}</p>
                          {alias.description && (
                            <p className="text-sm text-gray-500 mt-1">{alias.description}</p>
                          )}
                        </div>
                        <Badge variant={alias.active ? "default" : "secondary"}>
                          {alias.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPaymentLink(alias.alias)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(alias.paymentUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver URL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditAlias(alias)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAliasMutation.mutate(alias.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Planes de Suscripción */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingPlan ? "Editar Plan de Suscripción" : "Crear Plan de Suscripción"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input
                    {...planForm.register("name")}
                    placeholder="Plan Básico"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Precio</label>
                  <Input
                    {...planForm.register("price")}
                    placeholder="9999.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Intervalo</label>
                  <select {...planForm.register("interval")} className="w-full border rounded px-3 py-2">
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Características (separadas por coma)</label>
                  <Input
                    {...planForm.register("features")}
                    placeholder="Hasta 10 servicios, Soporte básico, Dashboard"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    {...planForm.register("description")}
                    placeholder="Descripción del plan..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                  >
                    {editingPlan ? "Actualizar" : "Crear"} Plan
                  </Button>
                  {editingPlan && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPlan(null);
                        planForm.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planes de Suscripción</CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <p>Cargando planes...</p>
              ) : plans.length === 0 ? (
                <p className="text-gray-500">No hay planes de suscripción configurados</p>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-lg font-bold text-green-600">
                            ${plan.price} {plan.currency} / {plan.interval === "monthly" ? "mes" : "año"}
                          </p>
                          {plan.description && (
                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                          )}
                          {plan.features && plan.features.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Características:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {plan.features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge variant={plan.active ? "default" : "secondary"}>
                          {plan.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}