import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SearchFilters } from "@/lib/types";
import type { Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
}

export default function SearchFiltersComponent({ filters, onFiltersChange, onApplyFilters }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClear = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onApplyFilters();
  };

  const priceRanges = [
    { label: "Hasta $100.000", min: 0, max: 100000 },
    { label: "$100.000 - $300.000", min: 100000, max: 300000 },
    { label: "$300.000 - $500.000", min: 300000, max: 500000 },
    { label: "Más de $500.000", min: 500000, max: undefined },
  ];

  const locations = [
    "Buenos Aires",
    "Córdoba",
    "Rosario",
    "Mendoza",
    "La Plata",
    "Mar del Plata",
    "Tucumán",
    "Salta",
  ];

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Rango de Precio</Label>
          <div className="space-y-3">
            {priceRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`price-${index}`}
                  checked={localFilters.minPrice === range.min && localFilters.maxPrice === range.max}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilterChange("minPrice", range.min);
                      handleFilterChange("maxPrice", range.max);
                    } else {
                      handleFilterChange("minPrice", undefined);
                      handleFilterChange("maxPrice", undefined);
                    }
                  }}
                />
                <Label htmlFor={`price-${index}`} className="text-sm text-gray-700">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Ubicación</Label>
          <Select 
            value={localFilters.location || ""} 
            onValueChange={(value) => handleFilterChange("location", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categoría</Label>
          <Select 
            value={localFilters.categoryId?.toString() || ""} 
            onValueChange={(value) => handleFilterChange("categoryId", value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Ordenar por</Label>
          <Select 
            value={localFilters.sortBy || ""} 
            onValueChange={(value) => handleFilterChange("sortBy", value || undefined)}
          >
            <SelectTrigger>
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

        <div className="space-y-2">
          <Button onClick={handleApply} className="w-full">
            Aplicar Filtros
          </Button>
          <Button onClick={handleClear} variant="outline" className="w-full">
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
