
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { dataIngestionService } from "./services/dataIngestion";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Import route handlers
import { apiRouter } from "./routes/api";
import { scheduledFunctions } from "./scheduled";

// Create Express app
const app = express();

// --- CORS Configuration ---
// Define allowed origins for production
const allowedOrigins = [
  'https://studio-9562671715-adbe9.web.app', // Your production hosting URL
  'http://localhost:3000', // Your local Next.js dev server
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In a development environment, dynamically allow origins from cloud workstations.
    if (process.env.NODE_ENV === 'development' && origin.includes('cloudworkstations.dev')) {
        return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This groups all the API v1 routes under a single /api parent
const api = express();
api.use("/v1", apiRouter);

// Health check endpoint
api.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount the entire API at the /api path to match the rewrite
app.use('/api', api);


// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "An unexpected error occurred",
    });
  }
);

// Export HTTP function
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
export const generateApiKeyForUser = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const crypto = require("crypto");
    const apiKey = `bh_live_${crypto.randomBytes(32).toString("hex")}`;

    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        apiKey,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { apiKey };
  }
);

export const manualDataSync = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to perform this action."
      );
    }

    console.log(`Manual data sync triggered by user: ${context.auth.uid}`);

    try {
      const result = await dataIngestionService.syncAllData();
      console.log("Manual sync completed successfully:", result);
      return {
        success: true,
        message: "Data sync completed successfully.",
        result,
      };
    } catch (error) {
      console.error("Manual sync failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during sync.";
      throw new functions.https.HttpsError("internal", errorMessage, error);
    }
  });
