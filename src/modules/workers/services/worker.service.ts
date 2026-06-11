import type {
  CreateWorkerDTO,
  UpdateWorkerDTO,
  WorkerFilters,
  WorkerResponse,
} from "../types";
import * as workerRepository from "../repositories/worker.repository";
import { uploadPhoto, deletePhoto } from "@utils/storage";

function sanitizeKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
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
  const { foto, ...rest } = data;
  const worker = await workerRepository.create(rest as CreateWorkerDTO);

  if (foto) {
    const key = `${worker.id}_${sanitizeKey(`${rest.nombre}_${rest.apellidos}`)}`;
    const url = await uploadPhoto(foto, key);
    if (url) {
      return workerRepository.update(worker.id, { foto: url });
    }
  }

  return worker;
}

export async function update(
  id: number,
  data: UpdateWorkerDTO,
): Promise<WorkerResponse> {
  const existing = await getById(id);
  const updateData = { ...data } as Record<string, unknown>;

  if (typeof data.foto === "string" && data.foto.startsWith("data:image")) {
    const key = `${id}_${sanitizeKey(`${data.nombre ?? ""}_${data.apellidos ?? ""}`)}`;
    const url = await uploadPhoto(data.foto, key);
    if (url) {
      await deletePhoto(existing.foto);
      updateData["foto"] = url;
    } else {
      delete updateData["foto"];
    }
  } else if (data.foto === null) {
    await deletePhoto(existing.foto);
    updateData["foto"] = null;
  } else {
    delete updateData["foto"];
  }

  return workerRepository.update(id, updateData as UpdateWorkerDTO);
}

export async function remove(id: number): Promise<void> {
  await workerRepository.softDelete(id);
}

export async function search(query: string): Promise<WorkerResponse[]> {
  return workerRepository.search(query);
}
