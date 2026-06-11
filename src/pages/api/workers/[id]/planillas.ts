import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";
import { db } from "@db/index";
import { trabajadoresPlanillas } from "@db/schemas/workers_planillas";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) return errorResponse(new AppError("ID de trabajador requerido", 400));

    const trabajadorId = Number(id);
    const body = await context.request.json();
    const planillaId = Number(body?.planillaId);

    if (!planillaId) return errorResponse(new AppError("planillaId requerido", 400));

    const [existing] = await db
      .select()
      .from(trabajadoresPlanillas)
      .where(
        and(
          eq(trabajadoresPlanillas.trabajadorId, trabajadorId),
          eq(trabajadoresPlanillas.planillaId, planillaId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .delete(trabajadoresPlanillas)
        .where(
          and(
            eq(trabajadoresPlanillas.trabajadorId, trabajadorId),
            eq(trabajadoresPlanillas.planillaId, planillaId),
          ),
        );
    } else {
      await db.insert(trabajadoresPlanillas).values({ trabajadorId, planillaId });
    }

    return successResponse({ attached: !existing });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar planilla", 500));
  }
};
