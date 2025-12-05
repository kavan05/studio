// functions/src/validation/schemas.ts
import { z } from "zod";

// Common pagination schema
const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
});

// Sanitize string to prevent injection attacks
const sanitizedString = z
  .string()
  .trim()
  .min(1, "Value cannot be empty")
  .max(200, "Value too long")
  .transform((val) => {
    // Remove potentially dangerous characters for NoSQL injection
    return val.replace(/[${}]/g, "");
  });

// Search businesses schema
export const searchBusinessesSchema = z.object({
  query: z.object({
    name: sanitizedString.refine((val) => val.length >= 2, {
      message: "Search term must be at least 2 characters",
    }),
    ...paginationSchema.shape,
  }),
});

// Category search schema
export const categorySearchSchema = z.object({
  query: z.object({
    type: sanitizedString.refine((val) => val.length >= 2, {
      message: "Category type must be at least 2 characters",
    }),
    ...paginationSchema.shape,
  }),
});

// City search schema
export const citySearchSchema = z.object({
  query: z.object({
    name: sanitizedString.refine((val) => val.length >= 2, {
      message: "City name must be at least 2 characters",
    }),
    ...paginationSchema.shape,
  }),
});

// Nearby search schema
export const nearbySearchSchema = z.object({
  query: z.object({
    lat: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(-90).max(90)),
    lng: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(-180).max(180)),
    radius: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive().max(100)), // Max 100km radius
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().max(100)),
  }),
});

// Get by ID schema
export const getByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, "Business ID is required")
      .max(200, "Invalid business ID")
      .regex(/^[a-zA-Z0-9_-]+$/, "Invalid business ID format"),
  }),
});

// Type exports for use in controllers
export type SearchBusinessesInput = z.infer<typeof searchBusinessesSchema>;
export type CategorySearchInput = z.infer<typeof categorySearchSchema>;
export type CitySearchInput = z.infer<typeof citySearchSchema>;
export type NearbySearchInput = z.infer<typeof nearbySearchSchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;
