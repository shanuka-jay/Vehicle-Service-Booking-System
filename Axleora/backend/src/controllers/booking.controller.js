import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { generateReference } from "../utils/generateReference.js";
import { normalizePhone } from "../utils/phone.js";
import { isPastServiceSlot } from "../utils/date.js";
import { destroyImage, uploadImage } from "../utils/cloudinary.js";
import { requireObjectId } from "../utils/objectId.js";
import { sendBookingConfirmation, sendBookingStatusUpdate } from "../utils/email.js";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(25, "Phone number is too long"),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  vehicleNumber: z.string().trim().min(3).max(20),
  vehicleType: z.string().trim().min(2).max(30),
  vehicleModel: z.string().trim().max(80).optional(),
  serviceCategoryId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid service"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().min(1),
  notes: z.string().max(1000).optional()
});

const include = { serviceCategory: true };
const slotCapacity = Math.max(1, Number(process.env.SLOT_CAPACITY || 3));

export async function createBooking(req, res) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Please check the booking details", errors: parsed.error.flatten().fieldErrors });
  }
  const phone = normalizePhone(parsed.data.phone);
  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone || phoneDigits.length < 9 || phoneDigits.length > 15) {
    return res.status(400).json({ message: "Please enter a valid phone number", errors: { phone: ["Use a valid local or international phone number"] } });
  }
  if (isPastServiceSlot(parsed.data.preferredDate, parsed.data.preferredTime)) {
    return res.status(400).json({ message: "Choose a valid future appointment time", errors: { preferredDate: ["Choose a future workshop date and time"], preferredTime: ["Choose a future workshop date and time"] } });
  }
  const service = await prisma.serviceCategory.findFirst({ where: { id: parsed.data.serviceCategoryId, isActive: true } });
  if (!service) return res.status(400).json({ message: "Selected service is unavailable" });

  const uploaded = req.file ? await uploadImage(req.file, "booking-photos") : null;
  try {
    const booking = await prisma.booking.create({
      data: {
        ...parsed.data,
        phone,
        email: parsed.data.email || null,
        photoUrl: uploaded?.url || null,
        photoPublicId: uploaded?.publicId || null,
        referenceNo: generateReference()
      },
      include
    });
    res.status(201).json(booking);
    if (booking.email) {
      sendBookingConfirmation(booking).catch(console.error);
    }
  } catch (error) {
    if (uploaded?.publicId) await destroyImage(uploaded.publicId).catch(console.error);
    throw error;
  }
}

export async function listBookings(req, res) {
  const { status, date, search } = req.query;
  const where = {
    ...(status && status !== "All" ? { status } : {}),
    ...(date ? { preferredDate: date } : {}),
    ...(search ? { OR: [
      { customerName: { contains: search } },
      { phone: { contains: search } },
      { vehicleNumber: { contains: search } },
      { referenceNo: { contains: search } }
    ] } : {})
  };
  res.json(await prisma.booking.findMany({ where, include, orderBy: { createdAt: "desc" } }));
}

export async function getBooking(req, res) {
  const id = requireObjectId(res, req.params.id, "booking");
  if (!id) return;
  const item = await prisma.booking.findUnique({ where: { id }, include });
  item ? res.json(item) : res.status(404).json({ message: "Booking not found" });
}

export async function searchStatus(req, res) {
  const referenceNo = String(req.query.referenceNo || "").trim();
  const phone = normalizePhone(req.query.phone);
  if (!referenceNo && !phone) return res.status(400).json({ message: "Enter a reference number or phone number" });
  const items = await prisma.booking.findMany({
    where: referenceNo ? { referenceNo: referenceNo.toUpperCase() } : { phone },
    take: 10,
    include,
    orderBy: { createdAt: "desc" }
  });
  if (!items.length) return res.status(404).json({ message: "No matching booking found" });
  res.json(items);
}

export async function updateStatus(req, res) {
  const id = requireObjectId(res, req.params.id, "booking");
  if (!id) return;
  const parsed = z.object({
    status: z.enum(["Pending", "Approved", "Completed", "Rejected"]),
    adminRemark: z.string().max(500).optional()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid status update" });
  const current = await prisma.booking.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ message: "Booking not found" });

  const allowed = { Pending: ["Approved", "Rejected"], Approved: ["Completed"], Completed: [], Rejected: [] };
  if (!allowed[current.status]?.includes(parsed.data.status))
    return res.status(409).json({ message: `Cannot change ${current.status} booking to ${parsed.data.status}` });

  if (parsed.data.status === "Approved") {
    if (isPastServiceSlot(current.preferredDate, current.preferredTime))
      return res.status(409).json({ message: "Past appointment slots cannot be approved" });
    const approvedAtSlot = await prisma.booking.count({
      where: { preferredDate: current.preferredDate, preferredTime: current.preferredTime, status: "Approved" }
    });
    if (approvedAtSlot >= slotCapacity)
      return res.status(409).json({ message: `This time slot has reached its workshop capacity of ${slotCapacity} vehicles` });
  }

  const updatedBooking = await prisma.booking.update({ where: { id }, data: parsed.data, include });
  res.json(updatedBooking);
  if (updatedBooking.email) {
    sendBookingStatusUpdate(updatedBooking, parsed.data.status, parsed.data.adminRemark).catch(console.error);
  }
}

export async function deleteBooking(req, res) {
  const id = requireObjectId(res, req.params.id, "booking");
  if (!id) return;
  const current = await prisma.booking.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ message: "Booking not found" });
  await prisma.booking.delete({ where: { id } });
  if (current.photoPublicId) await destroyImage(current.photoPublicId).catch(console.error);
  res.json({ message: "Booking deleted" });
}
