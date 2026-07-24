import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

const publicUser = ({ passwordHash, ...user }) => user;

async function emailInUse(email, excludeId) {
  if (!email) return false;
  return Boolean(await prisma.user.findFirst({
    where: { email: email.toLowerCase(), id: { not: excludeId } },
    select: { id: true }
  }));
}

export async function login(req, res) {
  const parsed = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Username and password are required" });
  const identity = parsed.data.username.toLowerCase();
  const user = await prisma.user.findFirst({ where: { OR: [{ username: identity }, { email: identity }] } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  if (!user.isActive) return res.status(403).json({ message: "This staff account has been disabled" });
  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = jwt.sign({ id: updated.id, role: updated.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: publicUser(updated) });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.isActive) return res.status(401).json({ message: "Account is no longer active" });
  res.json(publicUser(user));
}

export async function updateProfile(req, res) {
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(80),
    username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional().or(z.literal(""))
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid profile details" });
  const email = parsed.data.email?.toLowerCase() || null;
  if (await emailInUse(email, req.user.id)) return res.status(409).json({ message: "That email is already in use" });
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: parsed.data.fullName,
        username: parsed.data.username.toLowerCase(),
        email,
        phone: parsed.data.phone || null
      }
    });
    res.json(publicUser(user));
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "That username is already in use" });
    throw error;
  }
}

export async function changePassword(req, res) {
  const parsed = z.object({ currentPassword: z.string(), newPassword: z.string().min(8).max(72) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "New password must be 8–72 characters" });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) }
  });
  res.json({ message: "Password changed successfully" });
}
