import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Utensils, Camera, Palette, Mic, Plus } from "lucide-react";
import type { Category } from "@shared/schema";

export default function Categories() {
  const [, setLocation] = useLocation();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explora Nuestras Categorías
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Encuentra el servicio perfecto para tu evento. Desde música hasta catering, 
              tenemos proveedores especializados en cada categoría.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Plus;
              const imageUrl = categoryImages[index % categoryImages.length];
              
              return (
                <Card 
                  key={category.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={imageUrl}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Ver servicios</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctanos y te ayudaremos a encontrar el proveedor perfecto para tu evento especial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:info@eventmarket.com" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Contactar por Email
            </a>
            <a 
              href="tel:+541154321000" 
              className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}