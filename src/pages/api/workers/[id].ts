import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { NotFoundError, ValidationError, AppError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { updateWorkerSchema } from "@modules/workers/dto/worker.dto";
import * as workerService from "@modules/workers/services/worker.service";

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) {
      return errorResponse(new ValidationError("ID de trabajador requerido"));
    }

    const worker = await workerService.getById(id);
    return successResponse(worker);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al obtener trabajador", 500));
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) {
      return errorResponse(new ValidationError("ID de trabajador requerido"));
    }

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(updateWorkerSchema, body);
    const worker = await workerService.update(id, data);

    return successResponse(worker);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar trabajador", 500));
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) {
      return errorResponse(new ValidationError("ID de trabajador requerido"));
    }

    await workerService.remove(id);
    return successResponse({ message: "Trabajador eliminado correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al eliminar trabajador", 500));
  }
};
