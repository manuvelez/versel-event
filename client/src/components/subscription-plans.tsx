import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Gift, Star } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";

export default function SubscriptionPlans() {
  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const handlePlanSelect = (planName: string) => {
    // Create alias from plan name
    let alias = "";
    if (planName.includes("2 Meses")) {
      alias = "2-meses-gratis";
    } else if (planName.includes("Básico")) {
      alias = "plan-basico";
    } else if (planName.includes("Destacado") || planName.includes("Profesional")) {
      alias = "plan-destacado";
    }
    
    if (alias) {
      window.open(`/pay/${alias}`, "_blank");
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes("2 Meses")) return <Gift className="h-8 w-8 text-green-600" />;
    if (planName.includes("Básico")) return <Star className="h-8 w-8 text-blue-600" />;
    if (planName.includes("Destacado") || planName.includes("Profesional")) return <Crown className="h-8 w-8 text-purple-600" />;
    return <Star className="h-8 w-8 text-gray-600" />;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes("2 Meses")) return "border-green-200 bg-green-50 dark:bg-green-900/20";
    if (planName.includes("Básico")) return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
    if (planName.includes("Destacado") || planName.includes("Profesional")) return "border-purple-200 bg-purple-50 dark:bg-purple-900/20";
    return "border-gray-200 bg-gray-50 dark:bg-gray-900/20";
  };

  const getButtonColor = (planName: string) => {
    if (planName.includes("2 Meses")) return "bg-green-600 hover:bg-green-700";
    if (planName.includes("Básico")) return "bg-blue-600 hover:bg-blue-700";
    if (planName.includes("Destacado") || planName.includes("Profesional")) return "bg-purple-600 hover:bg-purple-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando planes...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay planes disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getPlanColor(plan.name)}`}>
          {plan.name.includes("Destacado") && (
            <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
              Más Popular
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getPlanIcon(plan.name)}
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {plan.name}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {plan.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${parseFloat(plan.price).toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  {plan.currency}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                por {plan.interval === "monthly" ? "mes" : "año"}
              </p>
              {plan.name.includes("2 Meses") && (
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  ¡Completamente Gratis!
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {plan.features && plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handlePlanSelect(plan.name)}
              className={`w-full text-white font-semibold py-3 rounded-lg transition-colors ${getButtonColor(plan.name)}`}
            >
              {plan.name.includes("2 Meses") ? "Comenzar Gratis" : "Seleccionar Plan"}
            </Button>

            {plan.name.includes("2 Meses") && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                No se requiere tarjeta de crédito
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}