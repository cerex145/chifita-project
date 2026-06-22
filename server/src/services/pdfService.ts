import fs from "node:fs/promises";
import path from "node:path";
import { fromBuffer } from "file-type";
import { uploadConfig } from "../config/uploads";

export async function validatePdfFile(file: Express.Multer.File) {
  if (!file.originalname.toLowerCase().endsWith(".pdf")) {
    throw new Error("El archivo debe tener extensión .pdf");
  }

  if (file.size > uploadConfig.maxPdfSizeBytes) {
    throw new Error(`El PDF no puede superar ${process.env.MAX_PDF_SIZE_MB ?? 20}MB`);
  }

  const type = await fromBuffer(file.buffer);

  if (type?.mime !== "application/pdf") {
    throw new Error("El archivo no parece ser un PDF válido");
  }
}

export async function generatePdfThumbnail(pdfPath: string, thumbnailPath: string) {
  try {
    const [{ createCanvas }, pdfjsModule] = await Promise.all([
      import("@napi-rs/canvas"),
      import("pdfjs-dist/legacy/build/pdf.mjs"),
    ]);
    const pdfjs = pdfjsModule as unknown as {
      getDocument: (config: { data: Uint8Array; useWorkerFetch: boolean }) => {
        promise: Promise<{
          getPage: (pageNumber: number) => Promise<{
            getViewport: (config: { scale: number }) => unknown;
            render: (config: { canvasContext: unknown; viewport: unknown; canvas: unknown }) => { promise: Promise<void> };
          }>;
          destroy?: () => Promise<void>;
          cleanup?: () => Promise<void>;
        }>;
      };
    };
    const data = await fs.readFile(pdfPath);
    const document = await pdfjs.getDocument({ data: new Uint8Array(data), useWorkerFetch: false }).promise;
    const page = await document.getPage(1);
    const viewport = page.getViewport({ scale: 0.75 });
    const viewportSize = viewport as { width: number; height: number };
    const canvas = createCanvas(Math.floor(viewportSize.width), Math.floor(viewportSize.height));
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context, viewport, canvas }).promise;
    await fs.writeFile(thumbnailPath, await canvas.encode("png"));
    await (document.destroy?.() ?? document.cleanup?.());

    return thumbnailPath;
  } catch (error) {
    await generateFallbackThumbnail(thumbnailPath);
    return thumbnailPath;
  }
}

async function generateFallbackThumbnail(thumbnailPath: string) {
  const { createCanvas } = await import("@napi-rs/canvas");
  const canvas = createCanvas(480, 640);
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 480, 640);
  context.fillStyle = "#eaf5fb";
  context.fillRect(32, 32, 416, 576);
  context.strokeStyle = "#062b49";
  context.lineWidth = 8;
  context.strokeRect(32, 32, 416, 576);
  context.fillStyle = "#062b49";
  context.font = "bold 72px Arial";
  context.fillText("PDF", 165, 330);
  context.font = "28px Arial";
  context.fillText("ChiFacademy", 150, 382);

  await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
  await fs.writeFile(thumbnailPath, await canvas.encode("png"));
}
