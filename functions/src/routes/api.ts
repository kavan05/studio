
// functions/src/routes/api.ts
import { Router } from "express";
import { validateApiKey } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimit";
import { apiLogger } from "../middleware/logger";
import { businessController } from "../controllers/businessController";

const router = Router();

// Apply middleware to all routes in this router
router.use(apiLogger);
router.use(validateApiKey);
router.use(rateLimiter);

// Business endpoints
router.get("/businesses/search", businessController.search);
router.get("/businesses/category", businessController.byCategory);
router.get("/businesses/city", businessController.byCity);
router.get("/businesses/nearby", businessController.nearby);
router.get("/businesses/:id", businessController.getById);

// Stats endpoint
router.get("/stats", businessController.getStats);

export { router as apiRouter };
