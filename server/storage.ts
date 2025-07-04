import { 
  users, providers, services, categories, reviews, favorites, promotions, distancePricing, packages, packageServices, subscriptionPlans, paymentAliases, subscriptions, userAnalytics,
  type User, type InsertUser,
  type Provider, type InsertProvider, 
  type Service, type InsertService,
  type Category,
  type Review, type InsertReview,
  type Favorite, type InsertFavorite,
  type Promotion, type InsertPromotion,
  type DistancePricing, type InsertDistancePricing,
  type Package, type InsertPackage,
  type PackageService, type InsertPackageService,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type PaymentAlias, type InsertPaymentAlias,
  type Subscription, type InsertSubscription,
  type UserAnalytics, type InsertUserAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, desc, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;

  // Providers
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByUserId(userId: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, updates: Partial<Provider>): Promise<Provider | undefined>;

  // Services
  getService(id: number): Promise<Service | undefined>;
  getServicesByProvider(providerId: number): Promise<Service[]>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  getFeaturedServices(): Promise<Service[]>;
  searchServices(filters: {
    query?: string;
    location?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: Partial<Service>): Promise<Service | undefined>;

  // Reviews
  getReviewsByService(serviceId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Favorites
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, serviceId: number): Promise<boolean>;

  // Promotions
  getActivePromotions(): Promise<Promotion[]>;
  getPromotionsByService(serviceId: number): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  deletePromotion(id: number): Promise<boolean>;

  // Distance Pricing
  getDistancePricingByProvider(providerId: number): Promise<DistancePricing[]>;
  createDistancePricing(distancePricing: InsertDistancePricing): Promise<DistancePricing>;
  updateDistancePricing(id: number, updates: Partial<DistancePricing>): Promise<DistancePricing | undefined>;
  deleteDistancePricing(id: number): Promise<boolean>;

  // Packages
  getPackagesByProvider(providerId: number): Promise<Package[]>;
  getPackage(id: number): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: number, updates: Partial<Package>): Promise<Package | undefined>;
  deletePackage(id: number): Promise<boolean>;

  // Package Services
  getPackageServices(packageId: number): Promise<PackageService[]>;
  createPackageService(packageService: InsertPackageService): Promise<PackageService>;
  updatePackageService(id: number, updates: Partial<PackageService>): Promise<PackageService | undefined>;
  deletePackageService(id: number): Promise<boolean>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // Payment Aliases
  getPaymentAliases(): Promise<PaymentAlias[]>;
  getPaymentAliasByAlias(alias: string): Promise<PaymentAlias | undefined>;
  createPaymentAlias(paymentAlias: InsertPaymentAlias): Promise<PaymentAlias>;
  updatePaymentAlias(id: number, updates: Partial<PaymentAlias>): Promise<PaymentAlias | undefined>;
  deletePaymentAlias(id: number): Promise<boolean>;

  // Subscriptions
  getSubscriptionsByUser(userId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined>;

  // User Analytics
  trackUserAction(analytics: InsertUserAnalytics): Promise<UserAnalytics>;
  getUserAnalytics(userId?: number, startDate?: Date, endDate?: Date): Promise<UserAnalytics[]>;
  getPageViewStats(pagePath?: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getPopularPages(limit?: number, startDate?: Date, endDate?: Date): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getProvider(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByUserId(userId: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db
      .insert(providers)
      .values(insertProvider)
      .returning();
    return provider;
  }

  async updateProvider(id: number, updates: Partial<Provider>): Promise<Provider | undefined> {
    const [updatedProvider] = await db
      .update(providers)
      .set(updates)
      .where(eq(providers.id, id))
      .returning();
    return updatedProvider || undefined;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.providerId, providerId));
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.categoryId, categoryId));
  }

  async getFeaturedServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.featured, true));
  }

  async searchServices(filters: {
    query?: string;
    location?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<Service[]> {
    let query = db.select().from(services);
    const conditions = [];

    if (filters.query) {
      conditions.push(like(services.title, `%${filters.query}%`));
    }

    if (filters.categoryId) {
      conditions.push(eq(services.categoryId, filters.categoryId));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(services.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(services.price, filters.maxPrice.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters.sortBy === 'price_asc') {
      query = query.orderBy(asc(services.price)) as any;
    } else if (filters.sortBy === 'price_desc') {
      query = query.orderBy(desc(services.price)) as any;
    } else {
      query = query.orderBy(desc(services.createdAt)) as any;
    }

    return await query;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async getReviewsByService(serviceId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.serviceId, serviceId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();
    return favorite;
  }

  async deleteFavorite(userId: number, serviceId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId)));
    return (result.rowCount || 0) > 0;
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.active, true),
          lte(promotions.validFrom, now),
          gte(promotions.validUntil, now)
        )
      );
  }

  async getPromotionsByService(serviceId: number): Promise<Promotion[]> {
    return await db.select().from(promotions).where(eq(promotions.serviceId, serviceId));
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const [promotion] = await db
      .insert(promotions)
      .values(insertPromotion)
      .returning();
    return promotion;
  }

  async deletePromotion(id: number): Promise<boolean> {
    const result = await db.delete(promotions).where(eq(promotions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getDistancePricingByProvider(providerId: number): Promise<DistancePricing[]> {
    return await db.select().from(distancePricing).where(eq(distancePricing.providerId, providerId));
  }

  async createDistancePricing(insertDistancePricing: InsertDistancePricing): Promise<DistancePricing> {
    const [distancePricingRecord] = await db
      .insert(distancePricing)
      .values(insertDistancePricing)
      .returning();
    return distancePricingRecord;
  }

  async updateDistancePricing(id: number, updates: Partial<DistancePricing>): Promise<DistancePricing | undefined> {
    const [updatedRecord] = await db
      .update(distancePricing)
      .set(updates)
      .where(eq(distancePricing.id, id))
      .returning();
    return updatedRecord || undefined;
  }

  async deleteDistancePricing(id: number): Promise<boolean> {
    const result = await db.delete(distancePricing).where(eq(distancePricing.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPackagesByProvider(providerId: number): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.providerId, providerId));
  }

  async getPackage(id: number): Promise<Package | undefined> {
    const [packageRecord] = await db.select().from(packages).where(eq(packages.id, id));
    return packageRecord || undefined;
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [packageRecord] = await db
      .insert(packages)
      .values(insertPackage)
      .returning();
    return packageRecord;
  }

  async updatePackage(id: number, updates: Partial<Package>): Promise<Package | undefined> {
    const [updatedPackage] = await db
      .update(packages)
      .set(updates)
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage || undefined;
  }

  async deletePackage(id: number): Promise<boolean> {
    const result = await db.delete(packages).where(eq(packages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPackageServices(packageId: number): Promise<PackageService[]> {
    return await db.select().from(packageServices).where(eq(packageServices.packageId, packageId));
  }

  async createPackageService(insertPackageService: InsertPackageService): Promise<PackageService> {
    const [packageService] = await db
      .insert(packageServices)
      .values(insertPackageService)
      .returning();
    return packageService;
  }

  async updatePackageService(id: number, updates: Partial<PackageService>): Promise<PackageService | undefined> {
    const [updatedPackageService] = await db
      .update(packageServices)
      .set(updates)
      .where(eq(packageServices.id, id))
      .returning();
    return updatedPackageService || undefined;
  }

  async deletePackageService(id: number): Promise<boolean> {
    const result = await db.delete(packageServices).where(eq(packageServices.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set(updates)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPaymentAliases(): Promise<PaymentAlias[]> {
    return await db.select().from(paymentAliases).where(eq(paymentAliases.active, true));
  }

  async getPaymentAliasByAlias(alias: string): Promise<PaymentAlias | undefined> {
    const [paymentAlias] = await db.select().from(paymentAliases).where(eq(paymentAliases.alias, alias));
    return paymentAlias || undefined;
  }

  async createPaymentAlias(insertAlias: InsertPaymentAlias): Promise<PaymentAlias> {
    const [paymentAlias] = await db
      .insert(paymentAliases)
      .values(insertAlias)
      .returning();
    return paymentAlias;
  }

  async updatePaymentAlias(id: number, updates: Partial<PaymentAlias>): Promise<PaymentAlias | undefined> {
    const [updatedAlias] = await db
      .update(paymentAliases)
      .set(updates)
      .where(eq(paymentAliases.id, id))
      .returning();
    return updatedAlias || undefined;
  }

  async deletePaymentAlias(id: number): Promise<boolean> {
    const result = await db.delete(paymentAliases).where(eq(paymentAliases.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription || undefined;
  }

  async trackUserAction(insertAnalytics: InsertUserAnalytics): Promise<UserAnalytics> {
    const [analytics] = await db
      .insert(userAnalytics)
      .values({
        userId: insertAnalytics.userId,
        sessionId: insertAnalytics.sessionId,
        pagePath: insertAnalytics.pagePath,
        actionType: insertAnalytics.actionType,
        actionDetails: insertAnalytics.actionDetails,
        userAgent: insertAnalytics.userAgent,
        ipAddress: insertAnalytics.ipAddress,
        referrer: insertAnalytics.referrer,
      })
      .returning();
    return analytics;
  }

  async getUserAnalytics(userId?: number, startDate?: Date, endDate?: Date): Promise<UserAnalytics[]> {
    let query = db.select().from(userAnalytics);
    const conditions = [];

    if (userId) {
      conditions.push(eq(userAnalytics.userId, userId));
    }

    if (startDate) {
      conditions.push(gte(userAnalytics.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(userAnalytics.timestamp, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(userAnalytics.timestamp));
  }

  async getPageViewStats(pagePath?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    let baseQuery = db.select({
      pagePath: userAnalytics.pagePath,
      views: sql<number>`count(*)`,
      uniqueUsers: sql<number>`count(distinct ${userAnalytics.userId})`,
      date: sql<string>`date(${userAnalytics.timestamp})`
    }).from(userAnalytics);

    const conditions = [eq(userAnalytics.actionType, 'page_view')];

    if (pagePath) {
      conditions.push(eq(userAnalytics.pagePath, pagePath));
    }

    if (startDate) {
      conditions.push(gte(userAnalytics.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(userAnalytics.timestamp, endDate));
    }

    baseQuery = baseQuery.where(and(...conditions)) as any;
    
    return await baseQuery
      .groupBy(userAnalytics.pagePath, sql`date(${userAnalytics.timestamp})`)
      .orderBy(desc(sql`date(${userAnalytics.timestamp})`));
  }

  async getPopularPages(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = db.select({
      pagePath: userAnalytics.pagePath,
      views: sql<number>`count(*)`,
      uniqueUsers: sql<number>`count(distinct ${userAnalytics.userId})`
    }).from(userAnalytics);

    const conditions = [eq(userAnalytics.actionType, 'page_view')];

    if (startDate) {
      conditions.push(gte(userAnalytics.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(userAnalytics.timestamp, endDate));
    }

    query = query.where(and(...conditions)) as any;

    return await query
      .groupBy(userAnalytics.pagePath)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();