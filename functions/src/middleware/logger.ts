
// functions/src/middleware/logger.ts
import { Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { AuthRequest } from "./auth";

export const apiLogger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;

    const logEntry = {
      userId: req.user?.uid || "anonymous",
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip,
      userAgent: req.get("User-Agent") || "",
    };

    try {
      await admin.firestore().collection("api_logs").add(logEntry);
    } catch (error) {
      console.error("Failed to write API log:", error);
    }
  });

  next();
};
