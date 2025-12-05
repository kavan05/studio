// functions/src/middleware/rateLimit.ts
import { Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { AuthRequest } from "./auth";

const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_PER_DAY || "1000");

export const rateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.uid) {
    // Should be handled by apiKeyValidator, but as a fallback
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { uid } = req.user;
  const userRef = admin.firestore().collection("users").doc(uid);

  try {
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = doc.data();
    const requestsToday = userData?.requestsToday || 0;

    if (requestsToday >= DAILY_LIMIT) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: `You have exceeded the daily limit of ${DAILY_LIMIT} requests.`,
      });
    }

    // Use a transaction to safely increment the counter
    await admin.firestore().runTransaction(async (transaction) => {
      transaction.update(userRef, {
        requestsToday: admin.firestore.FieldValue.increment(1),
        lastRequest: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
