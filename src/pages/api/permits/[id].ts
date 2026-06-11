import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { validateSchema } from "@utils/validators";
import { successResponse, errorResponse } from "@utils/response";
import { NotFoundError, ValidationError, AppError } from "@utils/errors";
import { z } from "zod";
import * as permitsService from "@modules/permits/services/permits.service";

const updateEsquelaSchema = z.object({
  cargo: z.string().optional(),
  ubicacion: z.string().optional(),
  tipoPermisoId: z.number().int().positive().optional(),
  cantidadDias: z.number().positive().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  periodoCorrespondiente: z.string().optional(),
  fechaIncorporacion: z.string().optional(),
  observaciones: z.string().optional(),
});

export const GET: APIRoute = async ({ params, request }) => {
  try {
    await requireAuth({ request } as any);

    const { id } = params;
    if (!id) throw new NotFoundError("ID no proporcionado");

    const result = await permitsService.findById(Number(id));
    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new NotFoundError("Esquela de permiso no encontrada"));
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    await requireAuth({ request } as any);

    const { id } = params;
    if (!id) throw new NotFoundError("ID no proporcionado");

    const body = await request.json().catch(() => ({}));
    const data = validateSchema(updateEsquelaSchema, body);

    const result = await permitsService.update(Number(id), data);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new ValidationError("Error al actualizar la esquela de permiso"));
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    await requireAuth({ request } as any);

    const { id } = params;
    if (!id) throw new NotFoundError("ID no proporcionado");

    await permitsService.softDelete(Number(id));
    return successResponse({ message: "Esquela de permiso eliminada correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new ValidationError("Error al eliminar la esquela de permiso"));
  }
};
