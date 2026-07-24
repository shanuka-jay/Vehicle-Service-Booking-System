import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { destroyImage, destroyImages, uploadImage } from "../utils/cloudinary.js";
import { requireObjectId } from "../utils/objectId.js";

export async function addServiceImages(req, res) {
  const serviceId = requireObjectId(res, req.params.id, "service");
  if (!serviceId) return;
  if (!req.files?.length) return res.status(400).json({ message: "Choose at least one image" });
  const service = await prisma.serviceCategory.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(404).json({ message: "Service not found" });

  const current = await prisma.serviceImage.count({ where: { serviceId } });
  if (current + req.files.length > 10) {
    return res.status(400).json({ message: "A service can have up to 10 gallery images" });
  }

  const uploaded = [];
  try {
    for (const file of req.files) uploaded.push(await uploadImage(file, "service-galleries"));
    await prisma.serviceImage.createMany({
      data: uploaded.map((image, index) => ({
        serviceId,
        imageUrl: image.url,
        publicId: image.publicId,
        altText: req.body.altText || `${service.name} workshop image`,
        sortOrder: current + index
      }))
    });
    res.status(201).json(await prisma.serviceImage.findMany({ where: { serviceId }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }));
  } catch (error) {
    await destroyImages(uploaded.map(image => image.publicId)).catch(console.error);
    throw error;
  }
}

export async function deleteServiceImage(req, res) {
  const serviceId = requireObjectId(res, req.params.id, "service");
  if (!serviceId) return;
  const imageId = requireObjectId(res, req.params.imageId, "service image");
  if (!imageId) return;
  const image = await prisma.serviceImage.findUnique({ where: { id: imageId } });
  if (!image || image.serviceId !== serviceId) return res.status(404).json({ message: "Service image not found" });
  await prisma.serviceImage.delete({ where: { id: imageId } });
  if (image.publicId) await destroyImage(image.publicId).catch(console.error);
  res.json({ message: "Gallery image removed" });
}

export async function reorderServiceImages(req, res) {
  const serviceId = requireObjectId(res, req.params.id, "service");
  if (!serviceId) return;
  const parsed = z.object({
    imageIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(10)
  }).safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.imageIds || []).size !== parsed.data?.imageIds.length) {
    return res.status(400).json({ message: "Invalid image order" });
  }
  const owned = await prisma.serviceImage.findMany({ where: { serviceId }, select: { id: true } });
  const ownedIds = new Set(owned.map(image => image.id));
  if (parsed.data.imageIds.length !== owned.length || parsed.data.imageIds.some(id => !ownedIds.has(id))) {
    return res.status(400).json({ message: "Image order must include every image from this service" });
  }
  await prisma.$transaction(parsed.data.imageIds.map((id, sortOrder) => prisma.serviceImage.update({ where: { id }, data: { sortOrder } })));
  res.json(await prisma.serviceImage.findMany({ where: { serviceId }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }));
}
