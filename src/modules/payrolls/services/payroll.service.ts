import { z } from "zod";
import { validateSchema } from "@utils/validators";
import { ValidationError, NotFoundError } from "@utils/errors";
import * as repository from "../repositories/payroll.repository";
import type {
  CreatePlanillaDTO,
  UpdatePlanillaDTO,
  PlanillaResponse,
  PlanillaWithWorkers,
  WorkerInfo,
} from "../types";

const createPlanillaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  tipo: z.enum(
    ["quincenal", "mensual", "vehicular", "administrativa", "temporal"],
    { errorMap: () => ({ message: "Tipo de planilla inválido" }) },
  ),
});

const updatePlanillaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  tipo: z
    .enum(
      ["quincenal", "mensual", "vehicular", "administrativa", "temporal"],
      { errorMap: () => ({ message: "Tipo de planilla inválido" }) },
    )
    .optional(),
  activo: z.boolean().optional(),
});

const assignWorkerSchema = z.object({
  trabajador_id: z.number(),
});

export async function findAll(filters: {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}): Promise<{ data: PlanillaResponse[]; total: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

  return repository.findAll({ page, limit, search: filters.search, activo: filters.activo });
}

export async function findById(id: number): Promise<PlanillaWithWorkers> {
  return repository.findById(id);
}

export async function create(data: unknown): Promise<PlanillaResponse> {
  const validated = validateSchema(createPlanillaSchema, data);
  return repository.create(validated as CreatePlanillaDTO);
}

export async function update(id: number, data: unknown): Promise<PlanillaResponse> {
  const validated = validateSchema(updatePlanillaSchema, data);
  if (Object.keys(validated).length === 0) {
    throw new ValidationError("No se proporcionaron campos para actualizar");
  }
  return repository.update(id, validated as UpdatePlanillaDTO);
}

export async function softDelete(id: number): Promise<void> {
  return repository.softDelete(id);
}

export async function assignWorker(trabajadorId: number, planillaId: number): Promise<void> {
  validateSchema(assignWorkerSchema, { trabajador_id: trabajadorId });
  return repository.assignWorker(trabajadorId, planillaId);
}

export async function removeWorker(trabajadorId: number, planillaId: number): Promise<void> {
  return repository.removeWorker(trabajadorId, planillaId);
}

export async function getWorkersByPlanilla(planillaId: number): Promise<WorkerInfo[]> {
  return repository.getWorkersByPlanilla(planillaId);
}
