// functions/src/middleware/validation.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema, ZodIssue } from "zod";

interface ValidatedRequest {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

/**
 * Creates a validation middleware for Express routes
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validate<T extends ZodSchema>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      const validated = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ValidatedRequest;

      // Attach validated data to request
      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query as typeof req.query;
      if (validated.params) req.params = validated.params as typeof req.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid request parameters",
          details: formattedErrors,
        });
      }

      // Unexpected error
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Request validation failed",
      });
    }
  };
}

/**
 * Sanitizes a string to prevent NoSQL injection
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  // Remove MongoDB/Firestore operators and special characters
  return input
    .replace(/[${}]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Sanitizes an object recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
