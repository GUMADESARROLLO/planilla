import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";
import { db } from "@db/index";
import { planillaDetalle } from "@db/schemas/planilla_detalle";
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
      .from(planillaDetalle)
      .where(
        and(
          eq(planillaDetalle.trabajadorId, trabajadorId),
          eq(planillaDetalle.planillaId, planillaId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .delete(planillaDetalle)
        .where(
          and(
            eq(planillaDetalle.trabajadorId, trabajadorId),
            eq(planillaDetalle.planillaId, planillaId),
          ),
        );
    } else {
      await db.insert(planillaDetalle).values({ trabajadorId, planillaId } as any);
    }

    return successResponse({ attached: !existing });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar planilla", 500));
  }
};
