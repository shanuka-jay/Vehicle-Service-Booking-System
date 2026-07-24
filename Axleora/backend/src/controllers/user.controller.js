import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireObjectId } from "../utils/objectId.js";

const userSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
};

const staffSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8).max(72),
  role: z.enum(["OWNER", "STAFF"]).default("STAFF")
});

function duplicateMessage(error) {
  if (error.code !== "P2002") return null;
  return "That username is already in use";
}

async function emailInUse(email, excludeId) {
  if (!email) return false;
  return Boolean(await prisma.user.findFirst({
    where: { email: email.toLowerCase(), ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true }
  }));
}

export async function listUsers(_req, res) {
  const users = await prisma.user.findMany({ select: userSelect, orderBy: [{ isActive: "desc" }, { fullName: "asc" }] });
  res.json(users);
}

export async function createUser(req, res) {
  const parsed = staffSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid staff details" });
  const email = parsed.data.email?.toLowerCase() || null;
  if (await emailInUse(email)) return res.status(409).json({ message: "That email is already in use" });
  try {
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        username: parsed.data.username.toLowerCase(),
        email,
        phone: parsed.data.phone || null,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(parsed.data.password, 12)
      },
      select: userSelect
    });
    res.status(201).json(user);
  } catch (error) {
    const message = duplicateMessage(error);
    if (message) return res.status(409).json({ message });
    throw error;
  }
}

export async function updateUser(req, res) {
  const id = requireObjectId(res, req.params.id, "staff account");
  if (!id) return;
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(80),
    username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    role: z.enum(["OWNER", "STAFF"]),
    isActive: z.boolean()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid staff details" });
  if (id === req.user.id && (!parsed.data.isActive || parsed.data.role !== "OWNER")) {
    return res.status(400).json({ message: "You cannot deactivate or remove your own owner access" });
  }
  const email = parsed.data.email?.toLowerCase() || null;
  if (await emailInUse(email, id)) return res.status(409).json({ message: "That email is already in use" });
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...parsed.data,
        username: parsed.data.username.toLowerCase(),
        email,
        phone: parsed.data.phone || null
      },
      select: userSelect
    });
    res.json(user);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ message: "Staff account not found" });
    const message = duplicateMessage(error);
    if (message) return res.status(409).json({ message });
    throw error;
  }
}

export async function resetUserPassword(req, res) {
  const id = requireObjectId(res, req.params.id, "staff account");
  if (!id) return;
  const parsed = z.object({ password: z.string().min(8).max(72) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Temporary password must be 8–72 characters" });
  try {
    await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ message: "Staff account not found" });
    throw error;
  }
}
