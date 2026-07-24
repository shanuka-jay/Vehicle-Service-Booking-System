import { Router } from "express";
import { gallery, recent, stats } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const router = Router();
router.use(requireAuth);
router.get("/stats", stats);
router.get("/recent-bookings", recent);
router.get("/gallery", gallery);
export default router;
