import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Categories from "@/pages/categories";
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import RegisterProvider from "@/pages/register-provider";
import ProviderPromotions from "@/pages/provider-promotions";
import ProviderDistancePricing from "@/pages/provider-distance-pricing";
import ProviderPackages from "@/pages/provider-packages";
import PackageCustomization from "@/pages/package-customization";
import PaymentManagement from "@/pages/payment-management";
import PaymentRedirect from "@/pages/payment-redirect";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import NotFound from "@/pages/not-found";
import { trackPageView } from "./lib/analytics";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Only track if analytics is working properly
    try {
      trackPageView(location);
    } catch (error) {
      // Silently fail if analytics isn't working
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/categories" component={Categories} />
      <Route path="/services/:id" component={ServiceDetail} />
      <Route path="/providers/:id" component={ProviderProfile} />
      <Route path="/register-provider" component={RegisterProvider} />
      <Route path="/provider/promotions" component={ProviderPromotions} />
      <Route path="/provider/distance-pricing" component={ProviderDistancePricing} />
      <Route path="/provider/packages" component={ProviderPackages} />
      <Route path="/packages/:id/customize" component={PackageCustomization} />
      <Route path="/payment-management" component={PaymentManagement} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/pay/:alias" component={PaymentRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
