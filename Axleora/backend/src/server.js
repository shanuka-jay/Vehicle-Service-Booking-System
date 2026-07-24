import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import userRoutes from "./routes/user.routes.js";
import siteRoutes from "./routes/site.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";

const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",").map(item => item.trim()).filter(Boolean) || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/testimonials", testimonialRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({
      status: "ok",
      database: "mongodb-atlas",
      media: process.env.CLOUDINARY_CLOUD_NAME ? "cloudinary" : "not-configured",
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(503).json({ status: "unavailable", database: "disconnected", timestamp: new Date().toISOString() });
  }
});

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Image must be 5MB or smaller" });
  if (err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ message: "Too many images selected. Upload no more than 8 at once." });
  if (err.message?.startsWith("Only JPG")) return res.status(400).json({ message: err.message });
  if (err.code === "P2023") return res.status(400).json({ message: "Invalid database identifier" });
  if (err.code === "P2025") return res.status(404).json({ message: "Record not found" });
  if (err.http_code) return res.status(502).json({ message: "Cloudinary could not process the image" });
  res.status(err.status || 500).json({ message: err.message || "Unexpected server error" });
});

const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () => console.log(`Axleora MongoDB API running at http://localhost:${port}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
