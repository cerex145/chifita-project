import fs from "node:fs/promises";
import path from "node:path";
import type { MemeStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { uploadConfig, toPublicUploadUrl } from "../config/uploads";
import { prisma } from "../db";
import { validateImageFile } from "../services/imageService";
import { safeUploadName } from "../utils/fileNames";
import { addUserPoints } from "../utils/rankCalculator";

const createMemeSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(1000).optional(),
});

const listMemesSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("APPROVED"),
});

const moderateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function createMeme(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (!req.file) return res.status(400).json({ message: "Image file is required" });

  const parsed = createMemeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid meme data", errors: parsed.error.flatten() });
  }

  let imageInfo: Awaited<ReturnType<typeof validateImageFile>>;
  try {
    imageInfo = await validateImageFile(req.file);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid image" });
  }

  const imageName = safeUploadName(req.file.originalname, imageInfo.extension);
  const imagePath = path.join(uploadConfig.memesDir, imageName);
  await fs.writeFile(imagePath, req.file.buffer);

  const meme = await prisma.meme.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrl: toPublicUploadUrl(imagePath),
      authorId: req.user.id,
      status: "PENDING",
    },
    include: { author: { select: { id: true, username: true, avatarUrl: true } }, likes: true },
  });

  return res.status(201).json({ meme });
}

export async function listMemes(req: Request, res: Response) {
  const parsed = listMemesSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: "Invalid meme filters" });

  const memes = await prisma.meme.findMany({
    where: { status: parsed.data.status as MemeStatus },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, username: true, avatarUrl: true } }, likes: true },
  });

  return res.json({ memes });
}

export async function listPendingMemes(_req: Request, res: Response) {
  const memes = await prisma.meme.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });

  return res.json({ memes });
}

export async function moderateMeme(req: Request, res: Response) {
  const parsed = moderateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid moderation status" });

  const previous = await prisma.meme.findUnique({ where: { id: String(req.params.id) } });
  if (!previous) return res.status(404).json({ message: "Meme not found" });

  const meme = await prisma.meme.update({
    where: { id: String(req.params.id) },
    data: { status: parsed.data.status },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });

  if (previous.status !== "APPROVED" && parsed.data.status === "APPROVED") {
    await addUserPoints(meme.authorId, 10);
  }

  return res.json({ meme });
}

export async function likeMeme(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  const memeId = String(req.params.id);

  const existing = await prisma.like.findUnique({
    where: { userId_memeId: { userId: req.user.id, memeId } },
  });

  if (existing) {
    const meme = await prisma.meme.findUnique({ where: { id: memeId } });
    return res.json({ meme });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.like.create({
      data: { userId: req.user!.id, memeId },
    });
    return tx.meme.update({
      where: { id: memeId },
      data: { likesCount: { increment: 1 } },
    });
  });

  await addUserPoints(result.authorId, 1);

  return res.json({ meme: result });
}

export async function unlikeMeme(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  const memeId = String(req.params.id);

  const existing = await prisma.like.findUnique({
    where: { userId_memeId: { userId: req.user.id, memeId } },
  });

  if (!existing) return res.status(204).send();

  const [, updatedMeme] = await prisma.$transaction([
    prisma.like.delete({ where: { id: existing.id } }),
    prisma.meme.update({ where: { id: memeId }, data: { likesCount: { decrement: 1 } } }),
  ]);

  await addUserPoints(updatedMeme.authorId, -1);

  return res.status(204).send();
}
