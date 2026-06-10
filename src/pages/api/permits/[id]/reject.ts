import type { APIRoute } from "astro";
import { requireRole } from "@middleware/auth";
import { validateSchema } from "@utils/validators";
import { successResponse, errorResponse } from "@utils/response";
import { NotFoundError, ValidationError, AppError } from "@utils/errors";
import { z } from "zod";
import * as permitsService from "@modules/permits/services/permits.service";

const rejectSchema = z.object({
  observaciones: z.string().optional(),
});

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const session = await requireRole("SUPERVISOR", "ADMIN")({ request } as any);

    const { id } = params;
    if (!id) throw new NotFoundError("ID no proporcionado");

    const body = await request.json().catch(() => ({}));
    const data = validateSchema(rejectSchema, body);

    const result = await permitsService.reject(Number(id), session.user.id);

    if (data.observaciones) {
      await permitsService.update(Number(id), { observaciones: data.observaciones });
    }

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(
      new ValidationError("Error al rechazar la esquela de permiso"),
    );
  }
};
