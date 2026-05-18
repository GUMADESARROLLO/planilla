import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, paginatedResponse, errorResponse } from "@utils/response";
import { ValidationError, AppError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { createWorkerSchema, workerFiltersSchema } from "@modules/workers/dto/worker.dto";
import type { WorkerFilters } from "@modules/workers/types";
import * as workerService from "@modules/workers/services/worker.service";

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const rawFilters: Record<string, unknown> = {};
    for (const [key, value] of context.url.searchParams.entries()) {
      rawFilters[key] = value;
    }

    const filters = validateSchema(workerFiltersSchema, rawFilters) as unknown as WorkerFilters;
    const result = await workerService.getAll(filters);

    return paginatedResponse(result.data, result.page, result.limit, result.total);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al listar trabajadores", 500));
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(createWorkerSchema, body);
    const worker = await workerService.create(data);

    return successResponse(worker);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al crear trabajador", 500));
  }
};
