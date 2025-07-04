import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Utensils, Camera, Palette, Mic, Plus } from "lucide-react";
import ServiceCard from "@/components/service-card";
import PromotionsCarousel from "@/components/promotions-carousel";
import SubscriptionPlans from "@/components/subscription-plans";
import type { ServiceWithProvider } from "@/lib/types";
import type { Category } from "@shared/schema";
import logoPath from "@assets/logo-transparent_1750096791746.png";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [, setLocation] = useLocation();

  const { data: featuredServices = [], isLoading: servicesLoading } = useQuery<ServiceWithProvider[]>({
    queryKey: ["/api/services/featured"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (searchLocation) params.set("location", searchLocation);
    setLocation(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setLocation(`/search?categoryId=${categoryId}`);
  };

  const categoryIcons = {
    "DJ & Música": Music,
    "Catering": Utensils,
    "Fotografía": Camera,
    "Decoración": Palette,
    "Sonido": Mic,
    "Iluminación": Plus,
  };

  const categoryImages = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-10 mx-auto max-w-4xl shadow-xl">
              <div className="mb-8 flex flex-col items-center text-center">
                <img 
                  src={logoPath} 
                  alt="Event Market Logo" 
                  className="mb-6 hover:scale-105 transition-transform duration-700 ease-in-out"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                    width: '270px',
                    height: '270px',
                    animation: 'logoEntrance 1.5s ease-out forwards, float 3s ease-in-out infinite 1.5s'
                  }}
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 leading-relaxed text-center drop-shadow-lg">
                Conectamos organizadores con proveedores de servicios profesionales para crear 
                <span className="text-rose-700 font-bold drop-shadow-md"> eventos excepcionales</span>
              </h1>
              <p className="text-base md:text-lg text-gray-800 mb-8 leading-relaxed text-center max-w-2xl mx-auto font-medium drop-shadow-md">
                Plataforma integral que facilita la búsqueda, comparación y contratación de servicios especializados 
                para todo tipo de eventos corporativos y sociales.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="¿Qué servicio buscas?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={searchLocation} onValueChange={setSearchLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las ubicaciones</SelectItem>
                        <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                        <SelectItem value="Rosario">Rosario</SelectItem>
                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {categories.slice(0, 5).map((category) => {
                const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Plus;
                return (
                  <Card 
                    key={category.id}
                    className="category-card cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <IconComponent className="h-6 w-6 text-primary mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    </CardContent>
                  </Card>
                );
              })}
              <Link href="/search">
                <Card className="category-card cursor-pointer hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <Plus className="h-6 w-6 text-primary mb-2 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">Ver Más</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionsCarousel />
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Servicios Destacados</h3>
            <p className="text-lg text-gray-600">Los proveedores mejor valorados por nuestros usuarios</p>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  featured={true}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/search">
              <Button size="lg" className="btn-animate bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Ver Todos los Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Explora por Categorías</h3>
            <p className="text-lg text-gray-600">Encuentra el servicio perfecto para tu tipo de evento</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.slice(0, 4).map((category, index) => (
              <div 
                key={category.id}
                className="group cursor-pointer category-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img 
                    src={categoryImages[index] || categoryImages[0]}
                    alt={category.name}
                    className="w-full h-64 object-cover img-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent group-hover:from-gray-900/80 transition-all duration-300"></div>
                  <div className="absolute bottom-6 left-6 right-6 transform transition-all duration-300 group-hover:translate-y-[-4px]">
                    <h4 className="text-xl font-bold text-white mb-2 transition-all duration-300 group-hover:text-yellow-200 group-hover:scale-105">{category.name}</h4>
                    <p className="text-gray-200 text-sm transition-all duration-300 group-hover:text-white">Ver servicios disponibles</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Planes para Proveedores
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Elige el plan perfecto para hacer crecer tu negocio y llegar a más clientes
            </p>
          </div>
          <SubscriptionPlans />
        </div>
      </section>
    </div>
  );
}
