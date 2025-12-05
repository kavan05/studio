/**
 * API Client for BizHub API
 * Handles all API communications with proper error handling, timeout, and retry logic
 */

export interface Business {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  category: string;
  naics_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface ApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export interface ApiStats {
  totalBusinesses: number;
  byProvince: Record<string, number>;
  apiVersion: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

class BizHubApiClient {
  private baseUrl: string;
  private lastRateLimitInfo: RateLimitInfo | null = null;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001/your-project/us-central1/api/api/v1";
  }

  /**
   * Get the last rate limit info from the previous request
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.lastRateLimitInfo;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    apiKey: string,
    options?: RequestInit & RequestOptions
  ): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY,
      signal,
      ...fetchOptions
    } = options || {};

    const url = `${this.baseUrl}${endpoint}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Combine with external signal if provided
        const combinedSignal = signal
          ? anySignal([signal, controller.signal])
          : controller.signal;

        const response = await fetch(url, {
          ...fetchOptions,
          signal: combinedSignal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...fetchOptions?.headers,
          },
        });

        clearTimeout(timeoutId);

        // Parse rate limit headers
        const rateLimitLimit = response.headers.get("X-RateLimit-Limit");
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        const rateLimitReset = response.headers.get("X-RateLimit-Reset");

        if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
          this.lastRateLimitInfo = {
            limit: parseInt(rateLimitLimit, 10),
            remaining: parseInt(rateLimitRemaining, 10),
            reset: parseInt(rateLimitReset, 10),
          };
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : retryDelay * Math.pow(2, attempt);

          if (attempt < retries) {
            await this.sleep(waitTime);
            continue;
          }
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        if (!response.ok) {
          const error: ApiError = await response.json().catch(() => ({
            error: "Unknown Error",
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort or specific errors
        if (
          error instanceof Error &&
          (error.name === "AbortError" ||
            error.message.includes("Rate limit") ||
            error.message.includes("401") ||
            error.message.includes("403"))
        ) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < retries) {
          await this.sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  async searchBusinesses(
    apiKey: string,
    name: string,
    page: number = 1,
    limit: number = 10,
    options?: RequestOptions
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/businesses/search?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`,
      apiKey,
      options
    );
  }

  async getBusinessesByCategory(
    apiKey: string,
    category: string,
    page: number = 1,
    limit: number = 10,
    options?: RequestOptions
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/businesses/category?type=${encodeURIComponent(category)}&page=${page}&limit=${limit}`,
      apiKey,
      options
    );
  }

  async getBusinessesByCity(
    apiKey: string,
    city: string,
    page: number = 1,
    limit: number = 10,
    options?: RequestOptions
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/businesses/city?name=${encodeURIComponent(city)}&page=${page}&limit=${limit}`,
      apiKey,
      options
    );
  }

  async getNearbyBusinesses(
    apiKey: string,
    lat: number,
    lng: number,
    radius: number = 10,
    limit: number = 10,
    options?: RequestOptions
  ): Promise<{ data: Business[]; radius: number; unit: string; center: { lat: number; lng: number } }> {
    return this.request(
      `/businesses/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`,
      apiKey,
      options
    );
  }

  async getBusinessById(
    apiKey: string,
    id: string,
    options?: RequestOptions
  ): Promise<Business> {
    return this.request<Business>(`/businesses/${id}`, apiKey, options);
  }

  async getStats(apiKey: string, options?: RequestOptions): Promise<ApiStats> {
    return this.request<ApiStats>("/stats", apiKey, options);
  }

  async exportData(
    apiKey: string,
    format: "json" | "csv" = "json",
    filters?: { city?: string; category?: string; province?: string; limit?: number },
    options?: RequestOptions
  ): Promise<Blob | { exportedAt: string; count: number; data: Business[] }> {
    const params = new URLSearchParams();
    params.set("format", format);
    if (filters?.city) params.set("city", filters.city);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.province) params.set("province", filters.province);
    if (filters?.limit) params.set("limit", filters.limit.toString());

    if (format === "csv") {
      const response = await fetch(`${this.baseUrl}/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: options?.signal,
      });
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      return response.blob();
    }

    return this.request(`/export?${params.toString()}`, apiKey, options);
  }
}

/**
 * Helper to combine multiple AbortSignals
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }

    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  return controller.signal;
}

export const apiClient = new BizHubApiClient();
