import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireObjectId } from "../utils/objectId.js";

const booleanValue = z.union([z.boolean(), z.enum(["true", "false"])]).transform(value => value === true || value === "true");
const schema = z.object({
  customerName: z.string().trim().min(2, "Customer name must contain at least 2 characters").max(80, "Customer name cannot exceed 80 characters"),
  vehicleLabel: z.string().trim().max(100, "Vehicle description cannot exceed 100 characters").optional().or(z.literal("")),
  quote: z.string().trim().min(20, "Testimonial must contain at least 20 characters").max(600, "Testimonial cannot exceed 600 characters"),
  rating: z.coerce.number().int().min(1, "Choose a rating from 1 to 5").max(5, "Choose a rating from 1 to 5"),
  sortOrder: z.coerce.number().int().min(0, "Display order cannot be negative").max(999, "Display order cannot exceed 999"),
  isFeatured: booleanValue,
  isActive: booleanValue
});

const parse = body => schema.safeParse({
  ...body,
  rating: body.rating ?? 5,
  sortOrder: body.sortOrder ?? 0,
  isFeatured: body.isFeatured ?? true,
  isActive: body.isActive ?? true
});
const dataFrom = data => ({ ...data, vehicleLabel: data.vehicleLabel || null });

export async function publicTestimonials(_req, res) {
  res.json(await prisma.testimonial.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  }));
}

export async function listTestimonials(_req, res) {
  res.json(await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }));
}

export async function createTestimonial(req, res) {
  const parsed = parse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please correct the highlighted testimonial fields", errors: parsed.error.flatten().fieldErrors });
  res.status(201).json(await prisma.testimonial.create({ data: dataFrom(parsed.data) }));
}

export async function updateTestimonial(req, res) {
  const id = requireObjectId(res, req.params.id, "testimonial");
  if (!id) return;
  const parsed = parse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please correct the highlighted testimonial fields", errors: parsed.error.flatten().fieldErrors });
  try {
    res.json(await prisma.testimonial.update({ where: { id }, data: dataFrom(parsed.data) }));
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ message: "Testimonial not found" });
    throw error;
  }
}

export async function deleteTestimonial(req, res) {
  const id = requireObjectId(res, req.params.id, "testimonial");
  if (!id) return;
  try {
    await prisma.testimonial.delete({ where: { id } });
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ message: "Testimonial not found" });
    throw error;
  }
}
