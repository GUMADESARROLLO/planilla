import type {
  CreateWorkerDTO,
  UpdateWorkerDTO,
  WorkerFilters,
  WorkerResponse,
} from "../types";
import * as workerRepository from "../repositories/worker.repository";
import { AppError } from "@utils/errors";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "workers");

async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function processPhoto(
  base64Data: string | null | undefined,
): Promise<string | null> {
  if (!base64Data) return null;

  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1] ?? "png";
  const buffer = Buffer.from(matches[2]!, "base64");

  await ensureUploadDir();

  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  const resized = await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .toFormat(ext === "jpg" ? "jpeg" : "png")
    .toBuffer();

  await writeFile(filepath, resized);

  return `/uploads/workers/${filename}`;
}

export async function getAll(
  filters: WorkerFilters,
): Promise<{
  data: WorkerResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  return workerRepository.findAll(filters);
}

export async function getById(id: number): Promise<WorkerResponse> {
  return workerRepository.findById(id);
}

export async function create(
  data: CreateWorkerDTO,
): Promise<WorkerResponse> {
  let fotoPath: string | null = null;

  if (data.foto) {
    fotoPath = await processPhoto(data.foto);
  }

  return workerRepository.create({
    ...data,
    foto: fotoPath,
  });
}

export async function update(
  id: number,
  data: UpdateWorkerDTO,
): Promise<WorkerResponse> {
  const updateData = { ...data };

  if (updateData.foto) {
    updateData.foto = await processPhoto(updateData.foto);
  }

  return workerRepository.update(id, updateData);
}

export async function remove(id: number): Promise<void> {
  await workerRepository.softDelete(id);
}

export async function search(query: string): Promise<WorkerResponse[]> {
  return workerRepository.search(query);
}
