import { fromBuffer } from "file-type";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function validateImageFile(file: Express.Multer.File) {
  const type = await fromBuffer(file.buffer);

  if (!type || !allowedImageTypes.has(type.mime)) {
    throw new Error("La imagen debe ser JPG, PNG, WEBP o GIF válido");
  }

  const extension = `.${type.ext === "jpg" ? "jpg" : type.ext}`;

  return { mime: type.mime, extension };
}
