
// functions/src/controllers/businessController.ts
import { Response } from "express";
import * as admin from "firebase-admin";
import { AuthRequest } from "../middleware/auth";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

class BusinessController {
  private db = admin.firestore();

  /**
   * Search businesses by name
   * GET /businesses/search?name=maple&page=1&limit=10
   */
  search = async (req: AuthRequest, res: Response) => {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      if (!name || typeof name !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Query parameter 'name' is required",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);

      const snapshot = await this.db
        .collection("businesses")
        .where("name", ">=", name.toUpperCase())
        .where("name", "<=", name.toUpperCase() + "\uf8ff")
        .limit(limitNum + 1)
        .get();

      const businesses = snapshot.docs.slice(0, limitNum).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const hasMore = snapshot.docs.length > limitNum;

      const response: PaginatedResponse<any> = {
        data: businesses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: businesses.length,
          hasMore,
        },
      };

      return res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to search businesses",
      });
    }
  }

  /**
   * Get businesses by category
   * GET /businesses/category?type=restaurant&page=1&limit=10
   */
  byCategory = async (req: AuthRequest, res: Response) => {
    try {
      const { type, page = 1, limit = 10 } = req.query;

      if (!type || typeof type !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Query parameter 'type' is required",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);

      const snapshot = await this.db
        .collection("businesses")
        .where("category", "==", type.toUpperCase())
        .limit(limitNum + 1)
        .get();

      const businesses = snapshot.docs.slice(0, limitNum).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const hasMore = snapshot.docs.length > limitNum;

      const response: PaginatedResponse<any> = {
        data: businesses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: businesses.length,
          hasMore,
        },
      };

      return res.json(response);
    } catch (error) {
      console.error("Category search error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch businesses by category",
      });
    }
  }

  /**
   * Get businesses by city
   * GET /businesses/city?name=Toronto&page=1&limit=10
   */
  byCity = async (req: AuthRequest, res: Response) => {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      if (!name || typeof name !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Query parameter 'name' is required",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 100);

      const snapshot = await this.db
        .collection("businesses")
        .where("city", "==", name.toUpperCase())
        .limit(limitNum + 1)
        .get();

      const businesses = snapshot.docs.slice(0, limitNum).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const hasMore = snapshot.docs.length > limitNum;

      const response: PaginatedResponse<any> = {
        data: businesses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: businesses.length,
          hasMore,
        },
      };

      return res.json(response);
    } catch (error) {
      console.error("City search error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch businesses by city",
      });
    }
  }

  /**
   * Get nearby businesses using geolocation
   * GET /businesses/nearby?lat=43.65&lng=-79.38&radius=10
   */
  nearby = async (req: AuthRequest, res: Response) => {
    try {
      const { lat, lng, radius = 10, limit = 10 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Query parameters 'lat' and 'lng' are required",
        });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);
      const limitNum = Math.min(parseInt(limit as string), 100);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid coordinates or radius",
        });
      }

      // Calculate bounding box
      const latDelta = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km
      const lngDelta = radiusKm / (111.32 * Math.cos(latitude * (Math.PI / 180)));

      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLng = longitude - lngDelta;
      const maxLng = longitude + lngDelta;

      // Query within bounding box
      const snapshot = await this.db
        .collection("businesses")
        .where("latitude", ">=", minLat)
        .where("latitude", "<=", maxLat)
        .limit(limitNum * 2) // Get more for filtering
        .get();

      // Filter by actual distance and longitude
      const businesses = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (
            !data.latitude ||
            !data.longitude ||
            data.longitude < minLng ||
            data.longitude > maxLng
          ) {
            return null;
          }

          const distance = this.calculateDistance(
            latitude,
            longitude,
            data.latitude,
            data.longitude
          );

          if (distance <= radiusKm) {
            return {
              id: doc.id,
              ...data,
              distance: parseFloat(distance.toFixed(2)),
            };
          }

          return null;
        })
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .sort((a, b) => a!.distance - b!.distance)
        .slice(0, limitNum);

      return res.json({
        data: businesses,
        radius: radiusKm,
        unit: "km",
        center: { lat: latitude, lng: longitude },
      });
    } catch (error) {
      console.error("Nearby search error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch nearby businesses",
      });
    }
  }

  /**
   * Get business by ID
   * GET /businesses/:id
   */
  getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const doc = await this.db.collection("businesses").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({
          error: "Not Found",
          message: "Business not found",
        });
      }

      return res.json({
        id: doc.id,
        ...doc.data(),
      });
    } catch (error) {
      console.error("Get by ID error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch business",
      });
    }
  }

  /**
   * Get API statistics
   * GET /stats
   */
  getStats = async (req: AuthRequest, res: Response) => {
    try {
      const [businessCount, provinceStats] = await Promise.all([
        this.getBusinessCount(),
        this.getProvinceStats(),
      ]);

      return res.json({
        totalBusinesses: businessCount,
        byProvince: provinceStats,
        apiVersion: "v1",
      });
    } catch (error) {
      console.error("Stats error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch statistics",
      });
    }
  }

  // Helper: Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper: Get total business count
  private async getBusinessCount(): Promise<number> {
    const snapshot = await this.db.collection("businesses").count().get();
    return snapshot.data().count;
  }

  // Helper: Get businesses grouped by province
  private async getProvinceStats(): Promise<Record<string, number>> {
    const provinces = ["ON", "BC", "AB", "QC", "MB", "SK", "NS", "NB", "PE", "NL", "YT", "NT", "NU"];
    const stats: Record<string, number> = {};

    await Promise.all(
      provinces.map(async (province) => {
        const snapshot = await this.db
          .collection("businesses")
          .where("province", "==", province)
          .count()
          .get();
        stats[province] = snapshot.data().count;
      })
    );

    return stats;
  }
}

export const businessController = new BusinessController();
