import type { Service, Provider, Category, Review } from "@shared/schema";

export interface ServiceWithProvider extends Service {
  provider?: Provider;
  category?: Category;
  reviews?: Review[];
}

export interface ProviderWithServices extends Provider {
  services?: ServiceWithCategory[];
}

export interface ServiceWithCategory extends Service {
  category?: Category;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}
