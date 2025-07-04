import { apiRequest } from "./queryClient";

export interface TrackingData {
  userId?: number;
  sessionId?: string;
  pagePath: string;
  actionType: 'page_view' | 'click' | 'search' | 'service_view' | 'contact' | 'favorite' | 'signup' | 'login';
  actionDetails?: any;
}

export async function trackUserAction(data: TrackingData) {
  try {
    // Generate a session ID if not provided
    if (!data.sessionId) {
      data.sessionId = getOrCreateSessionId();
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Failed to track user action:', error);
  }
}

export function trackPageView(pagePath: string, userId?: number) {
  trackUserAction({
    userId,
    pagePath,
    actionType: 'page_view',
  });
}

export function trackServiceView(serviceId: number, userId?: number) {
  trackUserAction({
    userId,
    pagePath: window.location.pathname,
    actionType: 'service_view',
    actionDetails: { serviceId },
  });
}

export function trackSearch(query: string, results: number, userId?: number) {
  trackUserAction({
    userId,
    pagePath: window.location.pathname,
    actionType: 'search',
    actionDetails: { query, results },
  });
}

export function trackClick(element: string, target?: string, userId?: number) {
  trackUserAction({
    userId,
    pagePath: window.location.pathname,
    actionType: 'click',
    actionDetails: { element, target },
  });
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Hook to automatically track page views
export function usePageTracking() {
  // This will be called from the router component to track page changes
}