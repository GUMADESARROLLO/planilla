import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { catalogService } from "@modules/catalogs/services/catalog.service";
import { successResponse, errorResponse } from "@utils/response";
import { AppError, NotFoundError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { z } from "zod";

const updateCatalogSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  descripcion: z.string().optional().nullable(),
  activo: z.boolean().optional(),
}).passthrough();

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const type = context.params["type"];
    const id = context.params["id"];
    if (!type || !id || !catalogService.getCatalogConfig(type)) {
      throw new AppError("Parámetros no válidos", 400, "INVALID_PARAMS");
    }

    const entry = await catalogService.findById(type, Number(id));
    if (!entry) throw new NotFoundError("Entrada no encontrada");

    return successResponse(entry);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al obtener entrada", 500, "INTERNAL_ERROR"));
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const type = context.params["type"];
    const id = context.params["id"];
    if (!type || !id || !catalogService.getCatalogConfig(type)) {
      throw new AppError("Parámetros no válidos", 400, "INVALID_PARAMS");
    }

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(updateCatalogSchema, body);

    const existing = await catalogService.findById(type, Number(id));
    if (!existing) throw new NotFoundError("Entrada no encontrada");

    const updated = await catalogService.update(type, Number(id), data);
    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar entrada", 500, "INTERNAL_ERROR"));
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const type = context.params["type"];
    const id = context.params["id"];
    if (!type || !id || !catalogService.getCatalogConfig(type)) {
      throw new AppError("Parámetros no válidos", 400, "INVALID_PARAMS");
    }

    const existing = await catalogService.findById(type, Number(id));
    if (!existing) throw new NotFoundError("Entrada no encontrada");

    await catalogService.softDelete(type, Number(id));
    return successResponse({ message: "Entrada eliminada correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al eliminar entrada", 500, "INTERNAL_ERROR"));
  }
};
