import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { destroyImage, destroyImages, uploadImage } from "../utils/cloudinary.js";
import { requireObjectId } from "../utils/objectId.js";
import { toSlug } from "../utils/slug.js";

const booleanValue = z.union([z.boolean(), z.enum(["true", "false"])]).transform(value => value === true || value === "true");
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1000),
  longDescription: z.string().trim().max(6000).optional().or(z.literal("")),
  estimatedDuration: z.string().max(50).optional().or(z.literal("")),
  priceRange: z.string().max(80).optional().or(z.literal("")),
  groupId: z.string().optional().or(z.literal("")),
  includedItems: z.string().max(4000).optional().or(z.literal("")),
  benefits: z.string().max(4000).optional().or(z.literal("")),
  isFeatured: booleanValue,
  isActive: booleanValue
});

const parse = body => schema.safeParse({ ...body, isActive: body.isActive ?? true, isFeatured: body.isFeatured ?? false });
const listJson = value => JSON.stringify((value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean));
const serviceData = data => ({
  name: data.name,
  slug: toSlug(data.name),
  description: data.description,
  longDescription: data.longDescription || null,
  estimatedDuration: data.estimatedDuration || null,
  priceRange: data.priceRange || null,
  groupId: data.groupId || null,
  includedItems: listJson(data.includedItems),
  benefits: listJson(data.benefits),
  isFeatured: data.isFeatured,
  isActive: data.isActive
});

async function validGroup(res, groupId) {
  if (!groupId) return true;
  const id = requireObjectId(res, groupId, "category");
  if (!id) return false;
  const group = await prisma.serviceGroup.findUnique({ where: { id } });
  if (group) return true;
  res.status(400).json({ message: "Selected category is unavailable", errors: { groupId: ["Choose an existing category"] } });
  return false;
}

const includeService = { group: true, images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } };

export async function listServices(_req, res) {
  res.json(await prisma.serviceCategory.findMany({ include: includeService, orderBy: [{ name: "asc" }] }));
}

export async function publicServices(_req, res) {
  res.json(await prisma.serviceCategory.findMany({ where: { isActive: true }, include: includeService, orderBy: [{ isFeatured: "desc" }, { name: "asc" }] }));
}

export async function publicService(req, res) {
  const service = await prisma.serviceCategory.findFirst({ where: { slug: req.params.slug, isActive: true }, include: includeService });
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json(service);
}

export async function createService(req, res) {
  const parsed = parse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please check service details", errors: parsed.error.flatten().fieldErrors });
  if (!(await validGroup(res, parsed.data.groupId))) return;

  const uploaded = req.file ? await uploadImage(req.file, "service-covers") : null;
  try {
    const service = await prisma.serviceCategory.create({
      data: {
        ...serviceData(parsed.data),
        imageUrl: uploaded?.url || null,
        imagePublicId: uploaded?.publicId || null
      },
      include: includeService
    });
    res.status(201).json(service);
  } catch (error) {
    if (uploaded?.publicId) await destroyImage(uploaded.publicId).catch(console.error);
    if (error.code === "P2002") return res.status(409).json({ message: "A service with this name already exists" });
    throw error;
  }
}

export async function updateService(req, res) {
  const id = requireObjectId(res, req.params.id, "service");
  if (!id) return;
  const current = await prisma.serviceCategory.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ message: "Service not found" });
  const parsed = parse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please correct the highlighted service fields", errors: parsed.error.flatten().fieldErrors });
  if (!(await validGroup(res, parsed.data.groupId))) return;

  const uploaded = req.file ? await uploadImage(req.file, "service-covers") : null;
  try {
    const service = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...serviceData(parsed.data),
        ...(uploaded ? { imageUrl: uploaded.url, imagePublicId: uploaded.publicId } : {})
      },
      include: includeService
    });
    if (uploaded && current.imagePublicId) await destroyImage(current.imagePublicId).catch(console.error);
    res.json(service);
  } catch (error) {
    if (uploaded?.publicId) await destroyImage(uploaded.publicId).catch(console.error);
    if (error.code === "P2002") return res.status(409).json({ message: "A service with this name already exists" });
    throw error;
  }
}

export async function deleteServiceCover(req, res) {
  const id = requireObjectId(res, req.params.id, "service");
  if (!id) return;
  const current = await prisma.serviceCategory.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ message: "Service not found" });
  if (!current.imageUrl) return res.status(400).json({ message: "This service does not have a cover image" });
  await prisma.serviceCategory.update({ where: { id }, data: { imageUrl: null, imagePublicId: null } });
  if (current.imagePublicId) await destroyImage(current.imagePublicId).catch(console.error);
  res.json({ message: "Cover image removed" });
}

export async function deleteService(req, res) {
  const id = requireObjectId(res, req.params.id, "service");
  if (!id) return;
  const current = await prisma.serviceCategory.findUnique({ where: { id }, include: { _count: { select: { bookings: true } }, images: true } });
  if (!current) return res.status(404).json({ message: "Service not found" });
  if (current._count.bookings) return res.status(409).json({ message: "This service has booking history. Deactivate it instead." });
  await prisma.serviceCategory.delete({ where: { id } });
  await destroyImages([current.imagePublicId, ...current.images.map(image => image.publicId)]).catch(console.error);
  res.json({ message: "Service deleted" });
}

const groupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0)
});

export async function publicGroups(_req, res) {
  res.json(await prisma.serviceGroup.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
}

export async function listGroups(_req, res) {
  res.json(await prisma.serviceGroup.findMany({ include: { _count: { select: { services: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }));
}

export async function createGroup(req, res) {
  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please correct the highlighted category fields", errors: parsed.error.flatten().fieldErrors });
  try {
    res.status(201).json(await prisma.serviceGroup.create({ data: { ...parsed.data, slug: toSlug(parsed.data.name), description: parsed.data.description || null } }));
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "That category already exists" });
    throw error;
  }
}

export async function updateGroup(req, res) {
  const id = requireObjectId(res, req.params.id, "category");
  if (!id) return;
  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please correct the highlighted category fields", errors: parsed.error.flatten().fieldErrors });
  try {
    res.json(await prisma.serviceGroup.update({ where: { id }, data: { ...parsed.data, slug: toSlug(parsed.data.name), description: parsed.data.description || null } }));
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ message: "Category not found" });
    if (error.code === "P2002") return res.status(409).json({ message: "That category already exists" });
    throw error;
  }
}

export async function deleteGroup(req, res) {
  const id = requireObjectId(res, req.params.id, "category");
  if (!id) return;
  const group = await prisma.serviceGroup.findUnique({ where: { id }, include: { _count: { select: { services: true } } } });
  if (!group) return res.status(404).json({ message: "Category not found" });
  if (group._count.services) return res.status(409).json({ message: "Move or remove services before deleting this category" });
  await prisma.serviceGroup.delete({ where: { id } });
  res.json({ message: "Category deleted" });
}
