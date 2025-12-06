
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

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API routes
// The base path is now handled by the rewrite in firebase.json
app.use("/", apiRouter);

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
