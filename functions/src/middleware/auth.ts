// functions/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { User } from "../types";

export interface AuthRequest extends Request {
  user?: User;
}

export const validateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "API key is missing or improperly formatted.",
    });
  }

  const apiKey = authHeader.split("Bearer ")[1];
  if (!apiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "API key is missing.",
    });
  }

  try {
    const usersRef = admin.firestore().collection("users");
    const snapshot = await usersRef.where("apiKey", "==", apiKey).limit(1).get();

    if (snapshot.empty) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid API key.",
      });
    }

    const userDoc = snapshot.docs[0];
    req.user = { id: userDoc.id, ...userDoc.data() } as any;

    return next();
  } catch (error) {
    console.error("API Key validation error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Could not validate API key.",
    });
  }
};
