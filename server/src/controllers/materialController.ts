import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import { z } from "zod";
import { uploadConfig, toPublicUploadUrl } from "../config/uploads";
import { prisma } from "../db";
import { safeUploadName } from "../utils/fileNames";
import { generatePdfThumbnail, validatePdfFile } from "../services/pdfService";

const listMaterialsSchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

const updateMaterialSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().min(2).max(80).optional(),
});

export async function listMaterials(req: Request, res: Response) {
  const parsed = listMaterialsSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid material filters", errors: parsed.error.flatten() });
  }

  const { category, page, limit } = parsed.data;
  const where = category && category !== "Todos" ? { category } : {};
  const [items, total] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    }),
    prisma.material.count({ where }),
  ]);

  return res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function createMaterial(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const body = updateMaterialSchema.required({ title: true, category: true }).safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({ message: "Invalid material data", errors: body.error.flatten() });
  }

  try {
    await validatePdfFile(req.file);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid PDF" });
  }

  const pdfName = safeUploadName(req.file.originalname, ".pdf");
  const pdfPath = path.join(uploadConfig.materialsDir, pdfName);
  await fs.writeFile(pdfPath, req.file.buffer);

  const thumbnailName = pdfName.replace(/\.pdf$/i, ".png");
  const thumbnailPath = path.join(uploadConfig.thumbnailsDir, thumbnailName);
  await generatePdfThumbnail(pdfPath, thumbnailPath);

  const material = await prisma.material.create({
    data: {
      title: body.data.title,
      description: body.data.description ?? null,
      category: body.data.category,
      fileUrl: toPublicUploadUrl(pdfPath),
      thumbnailUrl: toPublicUploadUrl(thumbnailPath),
      fileSize: req.file.size,
      authorId: req.user.id,
    },
  });

  return res.status(201).json({ material });
}

export async function updateMaterial(req: Request, res: Response) {
  const parsed = updateMaterialSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid material data", errors: parsed.error.flatten() });
  }

  const material = await prisma.material.update({
    where: { id: String(req.params.id) },
    data: parsed.data,
  });

  return res.json({ material });
}

export async function deleteMaterial(req: Request, res: Response) {
  const material = await prisma.material.delete({
    where: { id: String(req.params.id) },
  });

  await Promise.allSettled([removePublicFile(material.fileUrl), removePublicFile(material.thumbnailUrl)]);

  return res.status(204).send();
}

async function removePublicFile(url: string | null) {
  if (!url) return;

  const marker = "/uploads/";
  const index = url.indexOf(marker);

  if (index === -1) return;

  const relative = url.slice(index + marker.length).replace(/\//g, path.sep);
  const filePath = path.join(uploadConfig.root, relative);

  if (!filePath.startsWith(uploadConfig.root)) return;

  await fs.unlink(filePath).catch(() => undefined);
}
