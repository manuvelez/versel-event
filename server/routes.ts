import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProviderSchema, insertServiceSchema, insertReviewSchema, insertPromotionSchema, insertDistancePricingSchema, insertPackageSchema, insertPackageServiceSchema, insertUserAnalyticsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Featured services
  app.get("/api/services/featured", async (req, res) => {
    try {
      const services = await storage.getFeaturedServices();
      const servicesWithProviders = await Promise.all(
        services.map(async (service) => {
          const provider = await storage.getProvider(service.providerId);
          const category = await storage.getCategoryById(service.categoryId);
          return { ...service, provider, category };
        })
      );
      res.json(servicesWithProviders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured services" });
    }
  });

  // Search services
  app.get("/api/services/search", async (req, res) => {
    try {
      const { query, location, categoryId, minPrice, maxPrice, sortBy } = req.query;
      
      const filters = {
        query: query as string,
        location: location as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
      };

      const services = await storage.searchServices(filters);
      const servicesWithProviders = await Promise.all(
        services.map(async (service) => {
          const provider = await storage.getProvider(service.providerId);
          const category = await storage.getCategoryById(service.categoryId);
          return { ...service, provider, category };
        })
      );
      
      res.json(servicesWithProviders);
    } catch (error) {
      res.status(500).json({ error: "Failed to search services" });
    }
  });

  // Get service by ID
  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const provider = await storage.getProvider(service.providerId);
      const category = await storage.getCategoryById(service.categoryId);
      const reviews = await storage.getReviewsByService(id);
      
      res.json({ ...service, provider, category, reviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  // Get services by category
  app.get("/api/categories/:id/services", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const services = await storage.getServicesByCategory(categoryId);
      const servicesWithProviders = await Promise.all(
        services.map(async (service) => {
          const provider = await storage.getProvider(service.providerId);
          return { ...service, provider };
        })
      );
      
      res.json(servicesWithProviders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services by category" });
    }
  });

  // Get provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProvider(id);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      const services = await storage.getServicesByProvider(id);
      const servicesWithCategories = await Promise.all(
        services.map(async (service) => {
          const category = await storage.getCategoryById(service.categoryId);
          return { ...service, category };
        })
      );
      
      res.json({ ...provider, services: servicesWithCategories });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider" });
    }
  });

  // Register user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Register provider
  app.post("/api/providers/register", async (req, res) => {
    try {
      const providerData = insertProviderSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(providerData.userId);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Check if provider already exists for this user
      const existingProvider = await storage.getProviderByUserId(providerData.userId);
      if (existingProvider) {
        return res.status(400).json({ error: "Provider already exists for this user" });
      }

      const provider = await storage.createProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid provider data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to register provider" });
    }
  });

  // Create service
  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      
      // Verify provider exists
      const provider = await storage.getProvider(serviceData.providerId);
      if (!provider) {
        return res.status(400).json({ error: "Provider not found" });
      }

      // Verify category exists
      const category = await storage.getCategoryById(serviceData.categoryId);
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }

      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Add review
  app.post("/api/services/:id/reviews", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const reviewData = { ...req.body, serviceId };
      const validatedReview = insertReviewSchema.parse(reviewData);
      
      // Verify service exists
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(400).json({ error: "Service not found" });
      }

      const review = await storage.createReview(validatedReview);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Toggle favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, serviceId } = req.body;
      
      if (!userId || !serviceId) {
        return res.status(400).json({ error: "UserId and serviceId are required" });
      }

      // Check if already favorited
      const favorites = await storage.getFavoritesByUser(userId);
      const existingFavorite = favorites.find(fav => fav.serviceId === serviceId);
      
      if (existingFavorite) {
        // Remove favorite
        await storage.deleteFavorite(userId, serviceId);
        res.json({ favorited: false });
      } else {
        // Add favorite
        await storage.createFavorite({ userId, serviceId });
        res.json({ favorited: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  // Get user favorites
  app.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const favorites = await storage.getFavoritesByUser(userId);
      const favoritesWithServices = await Promise.all(
        favorites.map(async (favorite) => {
          const service = await storage.getService(favorite.serviceId);
          const provider = service ? await storage.getProvider(service.providerId) : null;
          return { ...favorite, service, provider };
        })
      );
      
      res.json(favoritesWithServices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Promotions routes
  app.get("/api/promotions/active", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active promotions" });
    }
  });

  app.get("/api/services/:serviceId/promotions", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const promotions = await storage.getPromotionsByService(serviceId);
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service promotions" });
    }
  });

  app.get("/api/providers/:providerId/promotions", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const services = await storage.getServicesByProvider(providerId);
      const serviceIds = services.map(s => s.id);
      
      const allPromotions = [];
      for (const serviceId of serviceIds) {
        const promotions = await storage.getPromotionsByService(serviceId);
        allPromotions.push(...promotions);
      }
      
      res.json(allPromotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider promotions" });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const promotionData = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(promotionData);
      res.status(201).json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid promotion data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    try {
      const promotionId = parseInt(req.params.id);
      const deleted = await storage.deletePromotion(promotionId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Promotion not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  // Distance Pricing routes
  app.get("/api/providers/:providerId/distance-pricing", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const distancePricing = await storage.getDistancePricingByProvider(providerId);
      res.json(distancePricing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch distance pricing" });
    }
  });

  app.post("/api/providers/:providerId/distance-pricing", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const distancePricingData = insertDistancePricingSchema.parse({
        ...req.body,
        providerId
      });
      const distancePricing = await storage.createDistancePricing(distancePricingData);
      res.status(201).json(distancePricing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid distance pricing data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create distance pricing" });
    }
  });

  app.put("/api/distance-pricing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const distancePricing = await storage.updateDistancePricing(id, updates);
      if (distancePricing) {
        res.json(distancePricing);
      } else {
        res.status(404).json({ error: "Distance pricing not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update distance pricing" });
    }
  });

  app.delete("/api/distance-pricing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDistancePricing(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Distance pricing not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete distance pricing" });
    }
  });

  // Package routes
  app.get("/api/providers/:providerId/packages", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const packages = await storage.getPackagesByProvider(providerId);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = await storage.getPackage(id);
      if (packageData) {
        res.json(packageData);
      } else {
        res.status(404).json({ error: "Package not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package" });
    }
  });

  app.post("/api/providers/:providerId/packages", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const packageData = insertPackageSchema.parse({
        ...req.body,
        providerId
      });
      const newPackage = await storage.createPackage(packageData);
      res.status(201).json(newPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid package data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create package" });
    }
  });

  app.put("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const packageData = await storage.updatePackage(id, updates);
      if (packageData) {
        res.json(packageData);
      } else {
        res.status(404).json({ error: "Package not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update package" });
    }
  });

  app.delete("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePackage(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Package not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete package" });
    }
  });

  // Package Services routes
  app.get("/api/packages/:packageId/services", async (req, res) => {
    try {
      const packageId = parseInt(req.params.packageId);
      const packageServices = await storage.getPackageServices(packageId);
      
      // Enrich with service details
      const enrichedServices = await Promise.all(
        packageServices.map(async (ps) => {
          const service = await storage.getService(ps.serviceId);
          return { ...ps, service };
        })
      );
      
      res.json(enrichedServices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package services" });
    }
  });

  app.post("/api/packages/:packageId/services", async (req, res) => {
    try {
      const packageId = parseInt(req.params.packageId);
      const packageServiceData = insertPackageServiceSchema.parse({
        ...req.body,
        packageId
      });
      const packageService = await storage.createPackageService(packageServiceData);
      res.status(201).json(packageService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid package service data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create package service" });
    }
  });

  app.put("/api/package-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const packageService = await storage.updatePackageService(id, updates);
      if (packageService) {
        res.json(packageService);
      } else {
        res.status(404).json({ error: "Package service not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update package service" });
    }
  });

  app.delete("/api/package-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePackageService(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Package service not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete package service" });
    }
  });

  // Subscription Plans routes (Admin only)
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      // In a real app, check if user is admin through authentication
      // For now, we'll allow access for demo purposes
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const plan = await storage.createSubscriptionPlan(req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subscription plan" });
    }
  });

  app.put("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updateSubscriptionPlan(id, req.body);
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription plan" });
    }
  });

  // Payment Aliases routes (Admin only)
  app.get("/api/payment-aliases", async (req, res) => {
    try {
      // In a real app, check if user is admin through authentication
      // For now, we'll allow access for demo purposes
      const aliases = await storage.getPaymentAliases();
      res.json(aliases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment aliases" });
    }
  });

  app.get("/api/payment-aliases/by-alias/:alias", async (req, res) => {
    try {
      const alias = req.params.alias;
      const paymentAlias = await storage.getPaymentAliasByAlias(alias);
      if (!paymentAlias) {
        return res.status(404).json({ error: "Payment alias not found" });
      }
      res.json(paymentAlias);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment alias" });
    }
  });

  app.post("/api/payment-aliases", async (req, res) => {
    try {
      const alias = await storage.createPaymentAlias(req.body);
      res.json(alias);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment alias" });
    }
  });

  app.put("/api/payment-aliases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alias = await storage.updatePaymentAlias(id, req.body);
      if (!alias) {
        return res.status(404).json({ error: "Payment alias not found" });
      }
      res.json(alias);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment alias" });
    }
  });

  app.delete("/api/payment-aliases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePaymentAlias(id);
      if (!deleted) {
        return res.status(404).json({ error: "Payment alias not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment alias" });
    }
  });

  // Payment redirect route
  app.get("/pay/:alias", async (req, res) => {
    try {
      const alias = req.params.alias;
      const paymentAlias = await storage.getPaymentAliasByAlias(alias);
      
      if (!paymentAlias) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Enlace de pago no encontrado</h1>
              <p>El alias de pago "${alias}" no existe o no está activo.</p>
              <a href="/" style="color: #007bff;">Volver al inicio</a>
            </body>
          </html>
        `);
      }

      // Redirect to the payment URL
      res.redirect(paymentAlias.paymentUrl);
    } catch (error) {
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Error</h1>
            <p>Hubo un error al procesar el enlace de pago.</p>
            <a href="/" style="color: #007bff;">Volver al inicio</a>
          </body>
        </html>
      `);
    }
  });

  // Analytics routes
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const analyticsData = {
        ...req.body,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        referrer: req.headers.referer
      };
      const validatedData = insertUserAnalyticsSchema.parse(analyticsData);
      const analytics = await storage.trackUserAction(validatedData);
      res.status(201).json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid analytics data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to track user action" });
      }
    }
  });

  app.get("/api/analytics/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const analytics = await storage.getUserAnalytics(userId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/page-views", async (req, res) => {
    try {
      const pagePath = req.query.pagePath as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const stats = await storage.getPageViewStats(pagePath, startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page view stats" });
    }
  });

  app.get("/api/analytics/popular-pages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const pages = await storage.getPopularPages(limit, startDate, endDate);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular pages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
