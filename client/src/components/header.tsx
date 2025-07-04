import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Menu, User, Heart, Bell, UserPlus, Tag, MapPin, Package } from "lucide-react";
import AnalyticsLink from "./analytics-link";
import logoPath from "@assets/logo-transparent_1750096791746.png";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (searchLocation) params.set("location", searchLocation);
    window.location.href = `/search?${params.toString()}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Event Market Logo" 
                className="w-12 h-12"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  Event Market
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            <div className="flex w-full bg-gray-50 rounded-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="¿Qué servicio buscas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="w-px bg-gray-300" />
              <Select value={searchLocation} onValueChange={setSearchLocation}>
                <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                  <SelectItem value="Córdoba">Córdoba</SelectItem>
                  <SelectItem value="Rosario">Rosario</SelectItem>
                  <SelectItem value="Mendoza">Mendoza</SelectItem>
                  <SelectItem value="La Plata">La Plata</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="rounded-l-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/search">
              <span className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                location === "/search" ? "text-primary" : ""
              }`}>
                Buscar Servicios
              </span>
            </Link>
            <Link href="/categories">
              <span className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Categorías
              </span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button size="sm">
              Registrarse
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Proveedores
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/register-provider" className="flex items-center w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrarse como Proveedor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/provider/promotions" className="flex items-center w-full">
                    <Tag className="h-4 w-4 mr-2" />
                    Gestionar Promociones
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/provider/distance-pricing" className="flex items-center w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Precios por Distancia
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/provider/packages" className="flex items-center w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Gestionar Paquetes
                  </Link>
                </DropdownMenuItem>
                {/* Only show payment management for main admin - for demo, always show */}
                <DropdownMenuItem>
                  <Link href="/payment-management" className="flex items-center w-full">
                    <Tag className="h-4 w-4 mr-2" />
                    Gestión de Pagos
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="space-y-3">
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
                    <Select value={searchLocation} onValueChange={setSearchLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las ubicaciones</SelectItem>
                        <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                        <SelectItem value="Rosario">Rosario</SelectItem>
                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Link href="/search">
                      <Button variant="ghost" className="w-full justify-start">
                        Buscar Servicios
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button variant="ghost" className="w-full justify-start">
                        Categorías
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Button variant="outline" className="w-full">
                      Iniciar Sesión
                    </Button>
                    <Button className="w-full">
                      Registrarse
                    </Button>
                    <Link href="/register-provider">
                      <Button variant="secondary" className="w-full">
                        Vender Servicios
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
