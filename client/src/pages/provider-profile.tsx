import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Users, 
  Mail, 
  Phone,
  CheckCircle,
  Grid,
  List
} from "lucide-react";
import ServiceCard from "@/components/service-card";
import type { ProviderWithServices } from "@/lib/types";

export default function ProviderProfile() {
  const [, params] = useRoute("/providers/:id");
  const providerId = params?.id ? parseInt(params.id) : null;

  const { data: provider, isLoading } = useQuery<ProviderWithServices>({
    queryKey: [`/api/providers/${providerId}`],
    enabled: !!providerId,
  });

  if (!providerId) {
    return <div>Proveedor no encontrado</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Services Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Proveedor no encontrado</h1>
            <p className="text-gray-600 mb-4">
              El proveedor que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/search">
              <Button>Buscar Servicios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeServices = provider.services?.filter(service => service.active) || [];
  const featuredServices = activeServices.filter(service => service.featured);
  const regularServices = activeServices.filter(service => !service.featured);

  const memberSince = new Date(provider.createdAt!).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Provider Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={provider.profileImage || '/placeholder-avatar.jpg'}
                  alt={provider.businessName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{provider.businessName}</h1>
                      {provider.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {provider.subscriptionPlan}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="ml-1">({provider.totalReviews} reseñas)</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{provider.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Miembro desde {memberSince}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Contactar
                    </Button>
                    <Button>
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {provider.description}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{activeServices.length} servicios activos</span>
                  </div>
                  {featuredServices.length > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span>{featuredServices.length} servicios destacados</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <TabsList>
              <TabsTrigger value="all">
                Todos los Servicios ({activeServices.length})
              </TabsTrigger>
              {featuredServices.length > 0 && (
                <TabsTrigger value="featured">
                  Destacados ({featuredServices.length})
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            {activeServices.length > 0 ? (
              <>
                {featuredServices.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-500" />
                      Servicios Destacados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {featuredServices.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={{ ...service, provider }} 
                          featured={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {regularServices.length > 0 && (
                  <div>
                    {featuredServices.length > 0 && (
                      <h3 className="text-xl font-semibold mb-4">Otros Servicios</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularServices.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={{ ...service, provider }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sin servicios activos
                  </h3>
                  <p className="text-gray-600">
                    Este proveedor no tiene servicios activos en este momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={{ ...service, provider }} 
                    featured={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sin servicios destacados
                  </h3>
                  <p className="text-gray-600">
                    Este proveedor no tiene servicios destacados en este momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>¿Interesado en trabajar con {provider.businessName}?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <p className="text-gray-600 mb-4">
                  Contacta directamente para discutir tus necesidades y obtener una cotización personalizada.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button>
                  <Phone className="w-4 h-4 mr-2" />
                  Contactar Ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
