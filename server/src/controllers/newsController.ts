import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { getNewsApiStatus, syncEconomicNews, syncPublicNewsIfNeeded } from "../services/newsService";

const listNewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export async function listNews(req: Request, res: Response) {
  const parsed = listNewsSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid news filters", errors: parsed.error.flatten() });
  }

  const { page, limit } = parsed.data;

  await syncPublicNewsIfNeeded().catch((error) => {
    console.warn("Public news auto-sync skipped", error);
  });

  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.newsArticle.count(),
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

export async function getNewsArticle(req: Request, res: Response) {
  const article = await prisma.newsArticle.findUnique({
    where: { id: String(req.params.id) },
  });

  if (!article) {
    return res.status(404).json({ message: "News article not found" });
  }

  return res.json({ article });
}

export async function refreshNews(_req: Request, res: Response) {
  try {
    const result = await syncEconomicNews();
    return res.json({ ...result, refreshedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(503).json({
      message: error instanceof Error ? error.message : "News provider unavailable",
      provider: getNewsApiStatus().provider,
    });
  }
}

export async function getNewsStatus(_req: Request, res: Response) {
  return res.json(getNewsApiStatus());
}
