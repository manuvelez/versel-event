import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, BarChart3, Users, Eye, MousePointer } from "lucide-react";
import { format, subDays } from "date-fns";
import { useState } from "react";

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data: pageViews, isLoading: pageViewsLoading } = useQuery({
    queryKey: ['/api/analytics/page-views', dateRange],
    queryFn: () => fetch(`/api/analytics/page-views?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`).then(res => res.json())
  });

  const { data: popularPages, isLoading: popularPagesLoading } = useQuery({
    queryKey: ['/api/analytics/popular-pages', dateRange],
    queryFn: () => fetch(`/api/analytics/popular-pages?limit=10&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`).then(res => res.json())
  });

  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useQuery({
    queryKey: ['/api/analytics/user', dateRange],
    queryFn: () => fetch(`/api/analytics/user?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`).then(res => res.json())
  });

  // Calculate totals
  const totalViews = pageViews?.reduce((sum: number, day: any) => sum + day.views, 0) || 0;
  const totalUniqueUsers = new Set(userAnalytics?.map((event: any) => event.userId).filter(Boolean)).size || 0;
  const totalEvents = userAnalytics?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Analytics</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vistas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas Populares</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popularPages?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Más Visitadas</CardTitle>
        </CardHeader>
        <CardContent>
          {popularPagesLoading ? (
            <div>Cargando...</div>
          ) : (
            <div className="space-y-3">
              {popularPages?.map((page: any, index: number) => (
                <div key={page.pagePath} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{index + 1}</span>
                    <div>
                      <div className="font-medium">{page.pagePath}</div>
                      <div className="text-sm text-muted-foreground">
                        {page.uniqueUsers} usuarios únicos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{page.views}</div>
                    <div className="text-sm text-muted-foreground">vistas</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {userAnalyticsLoading ? (
            <div>Cargando...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userAnalytics?.slice(0, 50).map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="font-medium">{event.actionType}</span>
                      <span className="text-muted-foreground"> en </span>
                      <span className="font-medium">{event.pagePath}</span>
                      {event.actionDetails && (
                        <div className="text-sm text-muted-foreground">
                          {JSON.stringify(event.actionDetails)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(event.timestamp), "HH:mm dd/MM")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}