import type { APIRoute } from "astro";
import { requireRole } from "@middleware/auth";
import { validateSchema } from "@utils/validators";
import { successResponse, errorResponse } from "@utils/response";
import { NotFoundError, ValidationError, AppError } from "@utils/errors";
import { z } from "zod";
import * as permitsService from "@modules/permits/services/permits.service";

const approveSchema = z.object({
  firmaDigital: z.string().optional(),
});

export const POST: APIRoute = async ({ params, request, url }) => {
  try {
    const session = await requireRole("SUPERVISOR", "ADMIN")({ request, url } as any);

    const { id } = params;
    if (!id) throw new NotFoundError("ID no proporcionado");

    const body = await request.json().catch(() => ({}));
    const data = validateSchema(approveSchema, body);

    const result = await permitsService.approve(
      Number(id),
      session.user.id,
      data.firmaDigital,
    );

    return successResponse({
      esquela: result.esquela,
      pdfBase64: result.pdfBase64,
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(
      new ValidationError("Error al aprobar la esquela de permiso"),
    );
  }
};
