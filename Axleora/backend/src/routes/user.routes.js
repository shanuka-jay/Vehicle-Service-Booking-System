import { Router } from "express";
import { createUser, listUsers, resetUserPassword, updateUser } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOwner } from "../middleware/owner.js";

const router = Router();
router.use(requireAuth, requireOwner);
router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/:id/password", resetUserPassword);
export default router;
