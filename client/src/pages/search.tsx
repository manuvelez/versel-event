import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SearchFilters from "@/components/search-filters";
import ServiceCard from "@/components/service-card";
import type { ServiceWithProvider, SearchFilters as SearchFiltersType } from "@/lib/types";

export default function Search() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchFiltersType>({});

  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: SearchFiltersType = {};
    
    if (searchParams.get("query")) initialFilters.query = searchParams.get("query")!;
    if (searchParams.get("location")) initialFilters.location = searchParams.get("location")!;
    if (searchParams.get("categoryId")) initialFilters.categoryId = parseInt(searchParams.get("categoryId")!);
    if (searchParams.get("minPrice")) initialFilters.minPrice = parseFloat(searchParams.get("minPrice")!);
    if (searchParams.get("maxPrice")) initialFilters.maxPrice = parseFloat(searchParams.get("maxPrice")!);
    if (searchParams.get("sortBy")) initialFilters.sortBy = searchParams.get("sortBy")!;
    
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [location]);

  const { data: services = [], isLoading, refetch } = useQuery<ServiceWithProvider[]>({
    queryKey: ["/api/services/search", appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/services/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
  });

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newUrl);
    
    refetch();
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy: sortBy || undefined };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const getResultsText = () => {
    const count = services.length;
    const locationText = appliedFilters.location ? ` en ${appliedFilters.location}` : "";
    return `${count} servicios encontrados${locationText}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
            />
          </div>

          {/* Results Area */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{getResultsText()}</h4>
                {appliedFilters.query && (
                  <p className="text-gray-600">
                    Resultados para "{appliedFilters.query}"
                  </p>
                )}
              </div>
              <Select 
                value={filters.sortBy || ""} 
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Más relevantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Más relevantes</SelectItem>
                  <SelectItem value="price_low">Menor precio</SelectItem>
                  <SelectItem value="price_high">Mayor precio</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Skeleton className="w-full md:w-64 h-48" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex justify-between items-center mt-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && services.length > 0 && (
              <div className="space-y-6">
                {services.map((service) => (
                  <Card key={service.id} className="search-result-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img 
                            src={service.images?.[0] || '/placeholder-service.jpg'} 
                            alt={service.title}
                            className="w-full h-48 md:h-full object-cover rounded-l-lg"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <ServiceCard service={service} compact={false} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && services.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No encontramos servicios que coincidan con tu búsqueda
                    </h3>
                    <p className="text-gray-600">
                      Intenta modificar los filtros o buscar algo diferente
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setFilters({});
                      setAppliedFilters({});
                      window.history.pushState({}, "", "/search");
                    }}
                    variant="outline"
                  >
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination (for future implementation) */}
            {!isLoading && services.length > 0 && (
              <div className="flex items-center justify-center mt-12">
                <div className="text-sm text-gray-500">
                  Mostrando {services.length} resultados
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
