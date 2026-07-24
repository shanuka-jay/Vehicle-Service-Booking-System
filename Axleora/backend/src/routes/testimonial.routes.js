import { Router } from "express";
import { createTestimonial, deleteTestimonial, listTestimonials, publicTestimonials, updateTestimonial } from "../controllers/testimonial.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/public", publicTestimonials);
router.get("/", requireAuth, listTestimonials);
router.post("/", requireAuth, createTestimonial);
router.put("/:id", requireAuth, updateTestimonial);
router.delete("/:id", requireAuth, deleteTestimonial);
export default router;
