import { Router } from "express";
import { createContact, deleteContact, listContacts, setContactRead, unreadCount } from "../controllers/contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/", createContact);
router.get("/", requireAuth, listContacts);
router.get("/unread-count", requireAuth, unreadCount);
router.put("/:id/read", requireAuth, setContactRead);
router.delete("/:id", requireAuth, deleteContact);
export default router;
