import path from "node:path";
import crypto from "node:crypto";

export function safeUploadName(originalName: string, extension: string) {
  const base = path
    .basename(originalName, path.extname(originalName))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);

  return `${base || "archivo"}-${crypto.randomUUID()}${extension}`;
}
