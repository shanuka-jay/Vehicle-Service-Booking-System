import { Router } from "express";
import { publicSettings, updateSettings } from "../controllers/site.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOwner } from "../middleware/owner.js";
const router = Router();
router.get("/public", publicSettings);
router.put("/", requireAuth, requireOwner, updateSettings);
export default router;
