import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Heart, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  Camera,
  Play,
  Share2,
  MessageCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ServiceWithProvider } from "@/lib/types";
import type { Review } from "@shared/schema";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:id");
  const serviceId = params?.id ? parseInt(params.id) : null;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    message: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: service, isLoading } = useQuery<ServiceWithProvider & { reviews: Review[] }>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string; userId: number }) => {
      return apiRequest("POST", `/api/services/${serviceId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] });
      setReviewComment("");
      setReviewRating(5);
      toast({
        title: "Reseña enviada",
        description: "Tu reseña ha sido publicada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", { 
        userId: 1, // TODO: Get from auth context
        serviceId: serviceId 
      });
    },
    onSuccess: () => {
      toast({
        title: "Favoritos",
        description: "Servicio agregado a favoritos.",
      });
    },
  });

  if (!serviceId) {
    return <div>Servicio no encontrado</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-96 rounded-lg" />
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-full h-24" />
            </div>
            <div className="space-y-6">
              <Skeleton className="w-full h-64" />
              <Skeleton className="w-full h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return <div>Servicio no encontrado</div>;
  }

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    toast({
      title: "Mensaje enviado",
      description: "El proveedor recibirá tu mensaje y se pondrá en contacto contigo.",
    });
    setContactForm({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      message: "",
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment,
      userId: 1, // TODO: Get from auth context
    });
  };

  const allImages = [...(service.images || []), ...(service.videos || [])];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                {allImages.length > 0 ? (
                  <>
                    <img 
                      src={allImages[selectedImageIndex]}
                      alt={service.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => favoriteMutation.mutate()}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex space-x-2 overflow-x-auto">
                          {allImages.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${service.title} ${index + 1}`}
                              className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                                selectedImageIndex === index ? 'border-primary' : 'border-white'
                              }`}
                              onClick={() => setSelectedImageIndex(index)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Service Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{service.provider?.rating || "0"}</span>
                        <span className="ml-1 text-gray-500">
                          ({service.provider?.totalReviews || 0} reseñas)
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{service.provider?.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{service.category?.name}</Badge>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <p className="font-semibold">{formatPrice(service.price, service.priceType).split(' ')[0]}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(service.price, service.priceType).split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                  </div>
                  {(service.minCapacity || service.maxCapacity) && (
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <div>
                        <p className="font-semibold">
                          {service.minCapacity && service.maxCapacity 
                            ? `${service.minCapacity}-${service.maxCapacity}`
                            : service.minCapacity 
                            ? `Mín. ${service.minCapacity}`
                            : `Máx. ${service.maxCapacity}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">personas</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <p className="font-semibold">Disponible</p>
                      <p className="text-sm text-gray-500">consultar fechas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre el Proveedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img 
                    src={service.provider?.profileImage || '/placeholder-avatar.jpg'}
                    alt={service.provider?.businessName}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{service.provider?.businessName}</h3>
                    <p className="text-gray-600 mb-2">{service.provider?.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Miembro desde 2019</span>
                      {service.provider?.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reseñas</CardTitle>
              </CardHeader>
              <CardContent>
                {service.reviews && service.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {service.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aún no hay reseñas para este servicio.</p>
                )}

                {/* Add Review Form */}
                <form onSubmit={handleReviewSubmit} className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Escribe una reseña</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Calificación</Label>
                      <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <div className="flex items-center">
                                {[...Array(rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-comment">Comentario</Label>
                      <Textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Comparte tu experiencia con este servicio..."
                        rows={3}
                      />
                    </div>
                    <Button type="submit" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Enviando..." : "Enviar Reseña"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar Proveedor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-date">Fecha del evento</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={contactForm.eventDate}
                      onChange={(e) => setContactForm({ ...contactForm, eventDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Cuéntanos sobre tu evento..."
                      rows={3}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto Directo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar ahora
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar email
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precio base:</span>
                    <span className="font-semibold">{formatPrice(service.price, service.priceType)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    * Los precios pueden variar según los requerimientos específicos del evento
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
