import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = allowedTypes.has(file.mimetype);
    cb(allowed ? null : new Error("Only JPG, PNG and WebP images are allowed"), allowed);
  }
});
