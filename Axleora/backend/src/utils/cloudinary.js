import { ensureCloudinaryConfig } from "../config/cloudinary.js";

const rootFolder = () => (process.env.CLOUDINARY_FOLDER || "axleora").replace(/^\/+|\/+$/g, "");

export function uploadImage(file, area) {
  if (!file?.buffer) return Promise.resolve(null);
  const cloudinary = ensureCloudinaryConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${rootFolder()}/${area}`,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => error ? reject(error) : resolve({
        url: result.secure_url,
        publicId: result.public_id
      })
    );
    stream.end(file.buffer);
  });
}

export async function destroyImage(publicId) {
  if (!publicId) return;
  const cloudinary = ensureCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}

export async function destroyImages(publicIds) {
  await Promise.all((publicIds || []).filter(Boolean).map(destroyImage));
}
