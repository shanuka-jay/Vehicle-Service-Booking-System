import { prisma } from "../config/prisma.js";
import { getColomboDate } from "../utils/date.js";

export async function stats(_req, res) {
  const today = getColomboDate();
  const [total, pending, approved, completed, rejected, todayCount, unreadMessages] = await Promise.all([
    prisma.booking.count(), prisma.booking.count({ where: { status: "Pending" } }),
    prisma.booking.count({ where: { status: "Approved" } }), prisma.booking.count({ where: { status: "Completed" } }),
    prisma.booking.count({ where: { status: "Rejected" } }), prisma.booking.count({ where: { preferredDate: today } }),
    prisma.contactMessage.count({ where: { isRead: false } })
  ]);
  res.json({ total, pending, approved, completed, rejected, today: todayCount, unreadMessages });
}
export async function recent(_req, res) {
  res.json(await prisma.booking.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { serviceCategory: true } }));
}
export async function gallery(_req, res) {
  const [services, bookings] = await Promise.all([
    prisma.serviceCategory.findMany({ where: { imageUrl: { not: null } }, select: { id: true, name: true, imageUrl: true } }),
    prisma.booking.findMany({ where: { photoUrl: { not: null } }, select: { id: true, referenceNo: true, customerName: true, photoUrl: true } })
  ]);
  res.json([
    ...services.map(item => ({ ...item, type: "Service", url: item.imageUrl, label: item.name })),
    ...bookings.map(item => ({ ...item, type: "Booking", url: item.photoUrl, label: `${item.referenceNo} · ${item.customerName}` }))
  ]);
}
