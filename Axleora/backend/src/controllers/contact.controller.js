import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireObjectId } from "../utils/objectId.js";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000)
});

export async function createContact(req, res) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Please check your contact details", errors: parsed.error.flatten().fieldErrors });
  }
  await prisma.contactMessage.create({ data: { ...parsed.data, phone: parsed.data.phone || null } });
  res.status(201).json({ message: "Message received. Our team will contact you shortly." });
}

export async function listContacts(req, res) {
  const isRead = req.query.status === "Unread" ? false : req.query.status === "Read" ? true : undefined;
  const messages = await prisma.contactMessage.findMany({
    where: isRead === undefined ? {} : { isRead },
    orderBy: { createdAt: "desc" }
  });
  res.json(messages);
}

export async function setContactRead(req, res) {
  const id = requireObjectId(res, req.params.id, "message");
  if (!id) return;
  const parsed = z.object({ isRead: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid message status" });
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Message not found" });
  res.json(await prisma.contactMessage.update({ where: { id }, data: parsed.data }));
}

export async function deleteContact(req, res) {
  const id = requireObjectId(res, req.params.id, "message");
  if (!id) return;
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Message not found" });
  await prisma.contactMessage.delete({ where: { id } });
  res.json({ message: "Message deleted" });
}

export async function unreadCount(_req, res) {
  res.json({ unread: await prisma.contactMessage.count({ where: { isRead: false } }) });
}
