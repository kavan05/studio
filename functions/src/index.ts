
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { dataIngestionService } from "./services/dataIngestion";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Import route handlers
import { apiRouter } from "./routes/api";
import { scheduledFunctions } from "./scheduled";

// Create Express app
const app = express();

// CORS configuration - restrict to allowed origins in production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:9002",
  "http://localhost:5000",
  process.env.PRODUCTION_URL,
  process.env.STAGING_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Enhanced health check endpoint
app.get("/health", async (req, res) => {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Check Firestore connectivity
  try {
    const firestoreStart = Date.now();
    await admin.firestore().collection("businesses").limit(1).get();
    checks.firestore = {
      status: "healthy",
      latency: Date.now() - firestoreStart,
    };
  } catch (err) {
    checks.firestore = {
      status: "unhealthy",
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }

  // Check Auth service
  try {
    checks.auth = { status: "healthy" };
  } catch (err) {
    checks.auth = {
      status: "unhealthy",
      error: err instanceof Error ? err.message : "Auth service unavailable",
    };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");
  const totalLatency = Date.now() - startTime;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
    latency: totalLatency,
    checks,
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/v1", apiRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred"
  });
});

// Export HTTP function with increased timeout and memory
export const api = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onRequest(app);

// Export scheduled functions
export const syncBusinessData = scheduledFunctions.syncBusinessData;
export const cleanupOldLogs = scheduledFunctions.cleanupOldLogs;
export const resetDailyLimits = scheduledFunctions.resetDailyLimits;
export const weeklyUsageReport = scheduledFunctions.weeklyUsageReport;

// Export utility functions for admin tasks
export const generateApiKeyForUser = functions.https.onCall(async (data, context) => {
  // Only authenticated users can call this
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = context.auth.uid;
  const crypto = require("crypto");
  const apiKey = `bh_live_${crypto.randomBytes(32).toString("hex")}`;

  // Update user document with new API key
  await admin.firestore().collection("users").doc(userId).update({
    apiKey,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { apiKey };
});

export const manualDataSync = functions.runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  }).https.onCall(async (data, context) => {
    
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to perform this action.");
  }
  
  // Optional: Add admin role check for production apps
  // const adminDoc = await admin.firestore().collection('admins').doc(context.auth.uid).get();
  // if (!adminDoc.exists) {
  //   throw new functions.https.HttpsError("permission-denied", "You do not have permission to perform this action.");
  // }

  console.log(`Manual data sync triggered by user: ${context.auth.uid}`);

  try {
    const result = await dataIngestionService.syncAllData();
    console.log("Manual sync completed successfully:", result);
    return { success: true, message: "Data sync completed successfully.", result };
  } catch (error) {
    console.error("Manual sync failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during sync.";
    throw new functions.https.HttpsError("internal", errorMessage, error);
  }
});
