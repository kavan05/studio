
// functions/src/services/dataIngestion.ts
import axios from "axios";
import { parse } from "csv-parse/sync";
import * as admin from "firebase-admin";

interface RawBusinessData {
  business_name?: string;
  NAME?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  category?: string;
  naics_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: string;
  longitude?: string;
  "Business Name"?: string;
  "Address"?: string;
  "City"?: string;
  "Postal Code"?: string;
  "Category"?: string;
  "NAICS Code"?: string;
  "Phone"?: string;
  "Email"?: string;
  "Website"?: string;
  [key: string]: any;
}

interface NormalizedBusiness {
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
  source: string;
  updatedAt: FirebaseFirestore.Timestamp;
}

type DataSource = {
    name: string;
    url: string;
    province: string;
    resource_id?: string; // resource_id is optional
}

// Data sources configuration
const DATA_SOURCES: Record<string, DataSource> = {
  ontario: {
    name: "Ontario Open Data",
    url: "https://data.ontario.ca/api/3/action/datastore_search",
    resource_id: process.env.ONTARIO_DATA_RESOURCE_ID,
    province: "ON",
  },
  bc: {
    name: "BC Data Catalogue",
    url: "https://catalogue.data.gov.bc.ca/api/3/action/datastore_search",
    resource_id: process.env.BC_DATA_RESOURCE_ID,
    province: "BC",
  },
  alberta: {
    name: "Alberta Open Data",
    url: "https://data.alberta.ca/api/3/action/datastore_search",
    resource_id: process.env.ALBERTA_DATA_RESOURCE_ID,
    province: "AB",
  },
  statscan: {
    name: "Statistics Canada",
    url: "https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata",
    province: "ALL",
  },
};

export class DataIngestionService {
  private _db: FirebaseFirestore.Firestore | null = null;
  private batchSize = 500;

  // Lazy getter for Firestore
  private get db(): FirebaseFirestore.Firestore {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  constructor() {
    // Don't initialize Firebase here - just set up the class
  }

  /**
   * Fetch data from a provincial open data portal
   */
  async fetchProvinceData(provinceKey: keyof typeof DATA_SOURCES): Promise<RawBusinessData[]> {
    const source = DATA_SOURCES[provinceKey];
    console.log(`Fetching data from ${source.name}...`);

    if (!source.resource_id) {
        console.log(`Skipping ${source.name} as it does not have a resource_id.`);
        return [];
    }
    
    try {
      const response = await axios.get(source.url, {
        params: {
          resource_id: source.resource_id,
          limit: 10000, // Adjust based on API limits
        },
        timeout: 30000,
      });

      if (response.data && response.data.result && response.data.result.records) {
        return response.data.result.records;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching data from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch CSV data from Open Canada
   */
  async fetchOpenCanadaCSV(csvUrl: string): Promise<RawBusinessData[]> {
    try {
      const response = await axios.get(csvUrl, {
        timeout: 60000,
        responseType: "text",
      });

      const records = parse(response.data, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return records;
    } catch (error) {
      console.error("Error fetching CSV data:", error);
      return [];
    }
  }

  /**
   * Normalize raw business data to unified schema
   */
  normalizeBusinessData(raw: RawBusinessData, source: string, province: string): NormalizedBusiness | null {
    try {
      const name = raw.business_name || raw["Business Name"] || raw.NAME;
      
      if (!name) {
        return null; // Skip records without a name
      }

      // Generate unique ID based on name and location
      const id = this.generateBusinessId(name, raw.city || raw["City"] || "", province);

      return {
        id,
        name: name.trim(),
        address: (raw.address || raw["Address"] || "").trim(),
        city: (raw.city || raw["City"] || "").trim(),
        province: province.toUpperCase(),
        postal_code: this.normalizePostalCode(raw.postal_code || raw["Postal Code"] || ""),
        category: (raw.category || raw["Category"] || raw.naics_code || "").trim(),
        naics_code: raw.naics_code || raw["NAICS Code"],
        phone: this.normalizePhone(raw.phone || raw["Phone"]),
        email: raw.email || raw["Email"],
        website: raw.website || raw["Website"],
        latitude: this.parseCoordinate(raw.latitude),
        longitude: this.parseCoordinate(raw.longitude),
        source,
        updatedAt: admin.firestore.Timestamp.now(),
      };
    } catch (error) {
      console.error("Error normalizing business data:", error);
      return null;
    }
  }

  /**
   * Generate unique business ID
   */
  private generateBusinessId(name: string, city: string, province: string): string {
    const normalized = `${name}_${city}_${province}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    return `biz_${normalized}`.substring(0, 100);
  }

  /**
   * Normalize Canadian postal code
   */
  private normalizePostalCode(postal: string): string {
    if (!postal) return "";
    
    // Remove spaces and convert to uppercase
    const cleaned = postal.replace(/\s+/g, "").toUpperCase();
    
    // Canadian postal code format: A1A 1A1
    if (cleaned.length === 6) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    }
    
    return cleaned;
  }

  /**
   * Normalize phone number
   */
  private normalizePhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    return phone;
  }

  /**
   * Parse coordinate string to number
   */
  private parseCoordinate(coord?: string): number | undefined {
    if (!coord) return undefined;
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Batch write businesses to Firestore
   */
  async batchWriteBusinesses(businesses: NormalizedBusiness[]): Promise<number> {
    let written = 0;
    const batches: admin.firestore.WriteBatch[] = [];
    let currentBatch = this.db.batch();
    let operationCount = 0;

    for (const business of businesses) {
      if (operationCount >= this.batchSize) {
        batches.push(currentBatch);
        currentBatch = this.db.batch();
        operationCount = 0;
      }

      const docRef = this.db.collection("businesses").doc(business.id);
      currentBatch.set(docRef, business, { merge: true });
      operationCount++;
      written++;
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Execute all batches
    for (const batch of batches) {
      await batch.commit();
    }

    console.log(`Successfully wrote ${written} businesses to Firestore`);
    return written;
  }

  /**
   * Remove duplicate businesses based on name and location
   */
  async deduplicateBusinesses(): Promise<number> {
    console.log("Starting deduplication process...");
    
    const businessesRef = this.db.collection("businesses");
    const snapshot = await businessesRef.get();
    
    const seen = new Map<string, string>(); // key: normalized identifier, value: doc ID
    const duplicates: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as NormalizedBusiness;
      const key = `${data.name}_${data.city}_${data.province}`.toLowerCase();

      if (seen.has(key)) {
        duplicates.push(doc.id);
      } else {
        seen.set(key, doc.id);
      }
    });

    // Delete duplicates in batches
    let deleted = 0;
    for (let i = 0; i < duplicates.length; i += this.batchSize) {
      const batch = this.db.batch();
      const chunk = duplicates.slice(i, i + this.batchSize);

      chunk.forEach((docId) => {
        batch.delete(businessesRef.doc(docId));
      });

      await batch.commit();
      deleted += chunk.length;
    }

    console.log(`Removed ${deleted} duplicate businesses`);
    return deleted;
  }

  /**
   * Main sync process
   */
  async syncAllData(): Promise<{
    fetched: number;
    normalized: number;
    written: number;
    deduplicated: number;
  }> {
    console.log("Starting full data sync...");
    const startTime = Date.now();

    let totalFetched = 0;
    let totalNormalized = 0;
    const allBusinesses: NormalizedBusiness[] = [];

    // Fetch from each province
    for (const [key, source] of Object.entries(DATA_SOURCES)) {
      try {
        const rawData = await this.fetchProvinceData(key as keyof typeof DATA_SOURCES);
        totalFetched += rawData.length;

        const normalized = rawData
          .map((raw) => this.normalizeBusinessData(raw, source.name, source.province))
          .filter((b): b is NormalizedBusiness => b !== null);

        totalNormalized += normalized.length;
        allBusinesses.push(...normalized);

        console.log(`${source.name}: fetched ${rawData.length}, normalized ${normalized.length}`);
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
      }
    }

    // Write to Firestore
    const written = await this.batchWriteBusinesses(allBusinesses);

    // Deduplicate
    const deduplicated = await this.deduplicateBusinesses();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Data sync completed in ${duration}s`);

    // Log sync metadata
    await this.db.collection("sync_logs").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      fetched: totalFetched,
      normalized: totalNormalized,
      written,
      deduplicated,
      duration: parseFloat(duration),
      status: "success",
    });

    return {
      fetched: totalFetched,
      normalized: totalNormalized,
      written,
      deduplicated,
    };
  }
}

// Export singleton instance
export const dataIngestionService = new DataIngestionService();
