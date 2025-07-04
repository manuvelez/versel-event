import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MapPin, Users } from "lucide-react";
import type { ServiceWithProvider } from "@/lib/types";

interface ServiceCardProps {
  service: ServiceWithProvider;
  featured?: boolean;
  compact?: boolean;
}

export default function ServiceCard({ service, featured = false, compact = false }: ServiceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  


  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Call API to toggle favorite
  };

  const formatPrice = (price: string, priceType: string) => {
    const numPrice = parseFloat(price);
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(numPrice);

    const typeMap = {
      per_event: 'por evento',
      per_hour: 'por hora',
      per_person: 'por persona',
    };

    return `${formatted} ${typeMap[priceType as keyof typeof typeMap] || ''}`;
  };

  if (compact) {
    return (
      <Link href={`/services/${service.id}`}>
        <Card className="service-card cursor-pointer h-full group">
          <div className="relative overflow-hidden">
            <img 
              src={service.imageUrl || service.images?.[0] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&w=800&h=600&fit=crop'} 
              alt={service.title}
              className="w-full h-32 object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&w=800&h=600&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white btn-animate"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-4 w-4 heart-animate ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover:text-red-400'}`} />
            </Button>
          </div>
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-primary">{service.title}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-current transition-transform duration-200 group-hover:rotate-12" />
                <span className="ml-1 text-xs text-gray-600 group-hover:text-gray-800 transition-colors duration-200">{service.provider?.rating || "0"}</span>
              </div>
              <p className="font-bold text-primary text-sm price-animate">
                {formatPrice(service.price, service.priceType).split(' ')[0]}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="service-card cursor-pointer overflow-hidden h-full group">
        <div className="relative overflow-hidden">
          <img 
            src={service.imageUrl || service.images?.[0] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&w=800&h=600&fit=crop'} 
            alt={service.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&w=800&h=600&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          <div className="absolute top-4 left-4 transform transition-all duration-300 group-hover:scale-110">
            {featured && (
              <Badge className="bg-yellow-500 text-black font-bold shadow-lg border-2 border-yellow-300 animate-pulse">
                ⭐ Destacado
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white btn-animate shadow-lg"
            onClick={handleFavoriteToggle}
          >
            <Heart className={`h-4 w-4 heart-animate ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 group-hover:text-red-400'}`} />
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-primary">{service.title}</h4>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="ml-1 text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-gray-900">
                {service.provider?.rating || "0"}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-3 transition-colors duration-300 group-hover:text-gray-700">{service.description}</p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
              <MapPin className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm">{service.provider?.location}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary price-animate">
                {formatPrice(service.price, service.priceType).split(' ')[0]}
              </p>
              <p className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                {formatPrice(service.price, service.priceType).split(' ').slice(1).join(' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={service.provider?.profileImage || '/placeholder-avatar.jpg'} 
                alt={service.provider?.businessName}
                className="w-8 h-8 rounded-full mr-2 transition-transform duration-300 group-hover:scale-110 shadow-md"
              />
              <span className="text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-gray-900">
                {service.provider?.businessName}
              </span>
            </div>
            <Button size="sm" className="btn-animate">
              Contactar
            </Button>
          </div>
          {(service.minCapacity || service.maxCapacity) && (
            <div className="flex items-center text-gray-500 mt-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {service.minCapacity && service.maxCapacity 
                  ? `${service.minCapacity}-${service.maxCapacity} personas`
                  : service.minCapacity 
                  ? `Mín. ${service.minCapacity} personas`
                  : `Máx. ${service.maxCapacity} personas`
                }
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
