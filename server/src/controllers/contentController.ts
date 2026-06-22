import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { defaultContent, isContentKey } from "../utils/defaultContent";

const updateContentSchema = z.object({
  content: z.string().min(1).max(10000),
});

export async function getContent(req: Request, res: Response) {
  const key = String(req.params.key);

  if (!isContentKey(key)) {
    return res.status(404).json({ message: "Content key not found" });
  }

  const pageContent = await prisma.pageContent.findUnique({ where: { key } });

  return res.json({
    key,
    content: pageContent?.content ?? defaultContent[key],
    updatedAt: pageContent?.updatedAt ?? null,
    isDefault: !pageContent,
  });
}

export async function updateContent(req: Request, res: Response) {
  const key = String(req.params.key);

  if (!isContentKey(key)) {
    return res.status(404).json({ message: "Content key not found" });
  }

  const parsed = updateContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid content data", errors: parsed.error.flatten() });
  }

  const pageContent = await prisma.pageContent.upsert({
    where: { key },
    create: {
      key,
      content: parsed.data.content,
    },
    update: {
      content: parsed.data.content,
    },
  });

  return res.json({
    key: pageContent.key,
    content: pageContent.content,
    updatedAt: pageContent.updatedAt,
    isDefault: false,
  });
}

export async function listContent(_req: Request, res: Response) {
  const savedContent = await prisma.pageContent.findMany();
  const savedByKey = new Map(savedContent.map((item) => [item.key, item]));

  return res.json({
    items: Object.entries(defaultContent).map(([key, fallback]) => {
      const saved = savedByKey.get(key);

      return {
        key,
        content: saved?.content ?? fallback,
        updatedAt: saved?.updatedAt ?? null,
        isDefault: !saved,
      };
    }),
  });
}
