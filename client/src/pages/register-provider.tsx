import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Building, 
  MapPin, 
  FileText, 
  CreditCard, 
  Check, 
  Star,
  Users,
  Camera,
  MessageCircle,
  BarChart3,
  HeadphonesIcon
} from "lucide-react";
import type { Category } from "@shared/schema";

interface RegistrationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: RegistrationStep[] = [
  {
    id: 1,
    title: "Información Personal",
    description: "Datos básicos de contacto",
    icon: User,
  },
  {
    id: 2,
    title: "Información del Negocio",
    description: "Detalles de tu empresa",
    icon: Building,
  },
  {
    id: 3,
    title: "Servicios",
    description: "Configura tus servicios",
    icon: FileText,
  },
  {
    id: 4,
    title: "Plan de Suscripción",
    description: "Elige tu plan",
    icon: CreditCard,
  },
];

export default function RegisterProvider() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  // Form data
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [providerForm, setProviderForm] = useState({
    businessName: "",
    description: "",
    location: "",
    subscriptionPlan: "basic",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    priceType: "per_event",
    minCapacity: "",
    maxCapacity: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Register user
      const userResponse = await apiRequest("POST", "/api/users/register", {
        ...userForm,
        username: userForm.email,
        isProvider: true,
      });
      const userData = await userResponse.json();

      // Step 2: Register provider
      const providerResponse = await apiRequest("POST", "/api/providers/register", {
        ...providerForm,
        userId: userData.id,
        subscriptionPlan: selectedPlan,
      });
      const providerData = await providerResponse.json();

      // Step 3: Create initial service if provided
      if (serviceForm.title && serviceForm.categoryId) {
        await apiRequest("POST", "/api/services", {
          ...serviceForm,
          providerId: providerData.id,
          categoryId: parseInt(serviceForm.categoryId),
          price: serviceForm.price,
          minCapacity: serviceForm.minCapacity ? parseInt(serviceForm.minCapacity) : undefined,
          maxCapacity: serviceForm.maxCapacity ? parseInt(serviceForm.maxCapacity) : undefined,
        });
      }

      return { user: userData, provider: providerData };
    },
    onSuccess: (data) => {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta de proveedor ha sido creada. Bienvenido a EventMarket.",
      });
      setLocation(`/providers/${data.provider.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error en el registro",
        description: error.message || "Hubo un problema al crear tu cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!acceptedTerms) {
      toast({
        title: "Términos requeridos",
        description: "Debes aceptar los términos y condiciones para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Las contraseñas ingresadas no son iguales.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate();
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return userForm.firstName && userForm.lastName && userForm.email && userForm.password && userForm.phone;
      case 2:
        return providerForm.businessName && providerForm.description && providerForm.location;
      case 3:
        return true; // Optional step
      case 4:
        return acceptedTerms;
      default:
        return false;
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "$9.999",
      description: "Perfecto para empezar",
      features: [
        "Perfil básico de proveedor",
        "Hasta 5 servicios publicados",
        "Galería de hasta 10 imágenes",
        "Mensajería básica",
        "Soporte por email",
      ],
      icon: User,
    },
    {
      id: "professional",
      name: "Profesional",
      price: "$19.999",
      description: "Para negocios en crecimiento",
      features: [
        "Perfil destacado de proveedor",
        "Servicios ilimitados",
        "Galería de hasta 50 imágenes + videos",
        "Mensajería avanzada",
        "Análiticas y estadísticas",
        "Soporte prioritario",
      ],
      icon: Building,
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$39.999",
      description: "Para empresas establecidas",
      features: [
        "Perfil premium con insignia",
        "Servicios ilimitados + destacados",
        "Galería ilimitada + videos 4K",
        "Mensajería premium",
        "Dashboard avanzado",
        "Soporte 24/7 + consultor",
      ],
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Únete como Proveedor
          </h1>
          <p className="text-lg text-gray-600">
            Conecta con miles de clientes y haz crecer tu negocio de eventos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-white"
                        : isActive
                        ? "border-primary text-primary bg-white"
                        : "border-gray-300 text-gray-400 bg-white"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden md:block absolute w-24 h-0.5 mt-6 transition-colors ${
                        currentStep > step.id ? "bg-primary" : "bg-gray-300"
                      }`}
                      style={{ marginLeft: "6rem" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Nombre del Negocio *</Label>
                  <Input
                    id="businessName"
                    value={providerForm.businessName}
                    onChange={(e) => setProviderForm({ ...providerForm, businessName: e.target.value })}
                    placeholder="ej. Fotografía Premium Events"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessDescription">Descripción del Negocio *</Label>
                  <Textarea
                    id="businessDescription"
                    value={providerForm.description}
                    onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                    placeholder="Describe tu negocio, experiencia y que lo hace único..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Ubicación *</Label>
                  <Select 
                    value={providerForm.location} 
                    onValueChange={(value) => setProviderForm({ ...providerForm, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                      <SelectItem value="Córdoba">Córdoba</SelectItem>
                      <SelectItem value="Rosario">Rosario</SelectItem>
                      <SelectItem value="Mendoza">Mendoza</SelectItem>
                      <SelectItem value="La Plata">La Plata</SelectItem>
                      <SelectItem value="Mar del Plata">Mar del Plata</SelectItem>
                      <SelectItem value="Tucumán">Tucumán</SelectItem>
                      <SelectItem value="Salta">Salta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Agrega tu primer servicio (opcional)</h4>
                  <p className="text-sm text-blue-700">
                    Puedes agregar un servicio ahora o hacerlo más tarde desde tu panel de control.
                  </p>
                </div>

                <div>
                  <Label htmlFor="serviceTitle">Título del Servicio</Label>
                  <Input
                    id="serviceTitle"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    placeholder="ej. Fotografía de Bodas Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceDescription">Descripción</Label>
                  <Textarea
                    id="serviceDescription"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="Describe tu servicio en detalle..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={serviceForm.categoryId} 
                      onValueChange={(value) => setServiceForm({ ...serviceForm, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priceType">Tipo de Precio</Label>
                    <Select 
                      value={serviceForm.priceType} 
                      onValueChange={(value) => setServiceForm({ ...serviceForm, priceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_event">Por evento</SelectItem>
                        <SelectItem value="per_hour">Por hora</SelectItem>
                        <SelectItem value="per_person">Por persona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Precio (ARS)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minCapacity">Capacidad Mínima</Label>
                    <Input
                      id="minCapacity"
                      type="number"
                      value={serviceForm.minCapacity}
                      onChange={(e) => setServiceForm({ ...serviceForm, minCapacity: e.target.value })}
                      placeholder="ej. 20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={serviceForm.maxCapacity}
                      onChange={(e) => setServiceForm({ ...serviceForm, maxCapacity: e.target.value })}
                      placeholder="ej. 200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription Plan */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Elige tu plan de suscripción</h3>
                  <p className="text-gray-600">
                    Puedes cambiar tu plan en cualquier momento desde tu panel de control
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const IconComponent = plan.icon;
                    const isSelected = selectedPlan === plan.id;

                    return (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary border-primary' : ''
                        } ${plan.popular ? 'relative border-primary' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary">Más Popular</Badge>
                          </div>
                        )}
                        
                        <CardContent className={`p-6 text-center ${plan.popular ? 'bg-primary/5' : ''}`}>
                          <div className="mb-4">
                            <IconComponent className={`w-8 h-8 mx-auto mb-2 ${plan.popular ? 'text-primary' : 'text-gray-600'}`} />
                            <h4 className="text-lg font-semibold">{plan.name}</h4>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          
                          <div className="mb-4">
                            <span className="text-2xl font-bold">{plan.price}</span>
                            <span className="text-gray-600">/mes</span>
                          </div>
                          
                          <ul className="space-y-2 text-sm text-left">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <a href="#" className="text-primary hover:underline">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-primary hover:underline">
                      política de privacidad
                    </a>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Miles de Clientes</h4>
            <p className="text-sm text-gray-600">Accede a una base amplia de clientes potenciales</p>
          </div>
          <div className="text-center">
            <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Showcase Profesional</h4>
            <p className="text-sm text-gray-600">Muestra tu trabajo con galerías atractivas</p>
          </div>
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Comunicación Directa</h4>
            <p className="text-sm text-gray-600">Conecta directamente con tus clientes</p>
          </div>
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Análiticas de Negocio</h4>
            <p className="text-sm text-gray-600">Monitorea el rendimiento de tus servicios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
