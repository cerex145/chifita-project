import fs from "node:fs/promises";
import path from "node:path";

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

export const uploadConfig = {
  root: uploadRoot,
  materialsDir: path.join(uploadRoot, "materials"),
  thumbnailsDir: path.join(uploadRoot, "thumbnails"),
  memesDir: path.join(uploadRoot, "memes"),
  maxPdfSizeBytes: Number(process.env.MAX_PDF_SIZE_MB ?? 20) * 1024 * 1024,
  maxImageSizeBytes: 8 * 1024 * 1024,
  publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
};

export async function ensureUploadDirs() {
  await fs.mkdir(uploadConfig.materialsDir, { recursive: true });
  await fs.mkdir(uploadConfig.thumbnailsDir, { recursive: true });
  await fs.mkdir(uploadConfig.memesDir, { recursive: true });
}

export function toPublicUploadUrl(filePath: string) {
  const relative = path.relative(uploadConfig.root, filePath).replace(/\\/g, "/");
  return `${uploadConfig.publicUrl}/uploads/${relative}`;
}
