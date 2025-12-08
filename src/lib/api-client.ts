/**
 * API Client for BizHub API
 * Handles all API communications with proper error handling
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
}

export interface ApiStats {
  totalBusinesses: number;
  byProvince: Record<string, number>;
  apiVersion: string;
}

class BizHubApiClient {
  private baseUrl: string;

  constructor() {
    // This now correctly uses the environment variable for both local and prod.
    // In local dev, it will be http://127.0.0.1:5001/...
    // In prod, it will be your deployed function URL.
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    apiKey: string,
    options?: RequestInit
  ): Promise<T> {
    // The endpoint now includes the /api/v1 prefix from the router
    const url = `${this.baseUrl}${endpoint}`;
    
    if (!this.baseUrl) {
      throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        let error: ApiError;
        try {
          error = await response.json();
        } catch (e) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Specifically check for network errors, which manifest as TypeError in fetch
        if (error instanceof TypeError) {
           throw new Error('Network error: Could not connect to the API. Is the server running?');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async searchBusinesses(
    apiKey: string,
    name: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/api/v1/businesses/search?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`,
      apiKey
    );
  }

  async getBusinessesByCategory(
    apiKey: string,
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/api/v1/businesses/category?type=${encodeURIComponent(category)}&page=${page}&limit=${limit}`,
      apiKey
    );
  }

  async getBusinessesByCity(
    apiKey: string,
    city: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Business>> {
    return this.request<ApiResponse<Business>>(
      `/api/v1/businesses/city?name=${encodeURIComponent(city)}&page=${page}&limit=${limit}`,
      apiKey
    );
  }

  async getNearbyBusinesses(
    apiKey: string,
    lat: number,
    lng: number,
    radius: number = 10,
    limit: number = 10
  ): Promise<{ data: Business[]; radius: number; unit: string; center: { lat: number; lng: number } }> {
    return this.request(
      `/api/v1/businesses/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`,
      apiKey
    );
  }

  async getBusinessById(apiKey: string, id: string): Promise<Business> {
    return this.request<Business>(`/api/v1/businesses/${id}`, apiKey);
  }

  async getStats(apiKey: string): Promise<ApiStats> {
    return this.request<ApiStats>('/api/v1/stats', apiKey);
  }
}

export const apiClient = new BizHubApiClient();
