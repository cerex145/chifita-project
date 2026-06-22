import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";

const categorySchema = z.object({
  name: z.string().min(2).max(80).trim(),
});

export async function listMaterialCategories(_req: Request, res: Response) {
  const categories = await prisma.materialCategory.findMany({
    orderBy: { name: "asc" },
  });

  return res.json({ categories });
}

export async function createMaterialCategory(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid category data", errors: parsed.error.flatten() });
  }

  const category = await prisma.materialCategory.create({
    data: { name: parsed.data.name },
  });

  return res.status(201).json({ category });
}

export async function updateMaterialCategory(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid category data", errors: parsed.error.flatten() });
  }

  const previous = await prisma.materialCategory.findUnique({ where: { id: String(req.params.id) } });

  if (!previous) {
    return res.status(404).json({ message: "Category not found" });
  }

  const [category] = await prisma.$transaction([
    prisma.materialCategory.update({
      where: { id: previous.id },
      data: { name: parsed.data.name },
    }),
    prisma.material.updateMany({
      where: { category: previous.name },
      data: { category: parsed.data.name },
    }),
  ]);

  return res.json({ category });
}

export async function deleteMaterialCategory(req: Request, res: Response) {
  const category = await prisma.materialCategory.findUnique({ where: { id: String(req.params.id) } });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const materialCount = await prisma.material.count({ where: { category: category.name } });

  if (materialCount > 0) {
    return res.status(409).json({ message: "No se puede eliminar una categoría con materiales asociados" });
  }

  await prisma.materialCategory.delete({ where: { id: category.id } });
  return res.status(204).send();
}
