import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Clock, Tag, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Promotion } from "@shared/schema";

interface PromotionWithService extends Promotion {
  service?: {
    id: number;
    title: string;
    categoryId: number;
  };
}

export default function PromotionsCarousel() {
  const { data: promotions, isLoading } = useQuery<PromotionWithService[]>({
    queryKey: ["/api/promotions/active"],
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    console.log('No hay promociones disponibles:', promotions);
    return (
      <div className="w-full mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Ofertas Especiales
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No hay promociones activas en este momento
          </p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="w-full mb-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 Ofertas Especiales
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Descuentos exclusivos por tiempo limitado
        </p>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {promotions.map((promotion) => (
            <CarouselItem key={promotion.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 border-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800">
                <div className="relative">
                  {promotion.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold">
                        -{promotion.discountPercentage}%
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {promotion.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {promotion.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(promotion.promotionalPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(promotion.originalPrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        Ahorra {formatPrice((parseFloat(promotion.originalPrice) - parseFloat(promotion.promotionalPrice)).toString())}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Hasta {formatDate(promotion.validUntil)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-red-500 font-medium">¡Tiempo limitado!</span>
                    </div>
                  </div>

                  <Link to={`/services/${promotion.serviceId}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold">
                      Ver Oferta
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}