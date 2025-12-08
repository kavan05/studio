
// functions/src/routes/api.ts
import { Router } from "express";
import { validateApiKey } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimit";
import { rateLimitHeaders } from "../middleware/rateLimitHeaders";
import { apiLogger } from "../middleware/logger";
import { validate } from "../middleware/validation";
import {
  searchBusinessesSchema,
  categorySearchSchema,
  citySearchSchema,
  nearbySearchSchema,
  getByIdSchema,
} from "../validation/schemas";
import { businessController } from "../controllers/businessController";

const router = Router();

// Apply middleware to all routes
router.use(apiLogger);
router.use(validateApiKey);
router.use(rateLimiter);
router.use(rateLimitHeaders);

// Business endpoints with validation
router.get("/businesses/search", validate(searchBusinessesSchema), businessController.search);
router.get("/businesses/category", validate(categorySearchSchema), businessController.byCategory);
router.get("/businesses/city", validate(citySearchSchema), businessController.byCity);
router.get("/businesses/nearby", validate(nearbySearchSchema), businessController.nearby);
router.get("/businesses/:id", validate(getByIdSchema), businessController.getById);

// Stats endpoint (no validation needed - no user input)
router.get("/stats", businessController.getStats);

// Export data endpoint
router.get("/export", businessController.exportData);

export { router as apiRouter };
