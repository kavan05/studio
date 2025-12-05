import { Timestamp } from "firebase-admin/firestore";

export interface User {
  uid: string;
  email: string;
  name: string;
  profession: string;
  referralSource: string;
  apiKey: string;
  usage: number;
  requestsToday: number;
  lastRequest?: Timestamp;
  createdAt: Timestamp;
}

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
  source: string;
  updatedAt: Timestamp;
}

export interface ApiLog {
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Timestamp;
  ip?: string;
  userAgent?: string;
}

export interface SyncLog {
  timestamp: Timestamp;
  fetched: number;
  normalized: number;
  written: number;
  deduplicated: number;
  duration: number;
  status: "success" | "error";
  error?: string;
}
