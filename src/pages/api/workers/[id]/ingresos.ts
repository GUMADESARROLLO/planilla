import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";
import { db } from "@db/index";
import { planillaDetalle } from "@db/schemas/planilla_detalle";
import { eq, and } from "drizzle-orm";

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    const planillaId = Number(new URL(context.request.url).searchParams.get("planillaId"));
    if (!id || !planillaId) return errorResponse(new AppError("IDs requeridos", 400));

    const [row] = await db
      .select()
      .from(planillaDetalle)
      .where(
        and(
          eq(planillaDetalle.planillaId, planillaId),
          eq(planillaDetalle.trabajadorId, Number(id)),
        ),
      )
      .limit(1);

    return successResponse(row ?? null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al cargar datos", 500));
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    const planillaId = Number(new URL(context.request.url).searchParams.get("planillaId"));
    if (!id || !planillaId) return errorResponse(new AppError("IDs requeridos", 400));

    const body = await context.request.json().catch(() => ({}));
    const trabajadorId = Number(id);

    const data = {
      planillaId,
      trabajadorId,
      salarioOrdinario: String(body.salarioOrdinario ?? 0),
      hrsExtras: String(body.hrsExtras ?? 0),
      montoHrsExtras: String(body.montoHrsExtras ?? 0),
      ingresoGravable: String(body.ingresoGravable ?? 0),
      ingresoNoGravable: String(body.ingresoNoGravable ?? 0),
      diasVacDescanso: String(body.diasVacDescanso ?? 0),
      montoVacDescanso: String(body.montoVacDescanso ?? 0),
      diasSubMaternidad: String(body.diasSubMaternidad ?? 0),
      montoSubMaternidad: String(body.montoSubMaternidad ?? 0),
      diasSubsidio: String(body.diasSubsidio ?? 0),
      montoSubEstatal: String(body.montoSubEstatal ?? 0),
      diasLaborados: String(body.diasLaborados ?? 15),
      hrsDeducir: String(body.hrsDeducir ?? 0),
      montoHrsDeducir: String(body.montoHrsDeducir ?? 0),
      inssLaboral: String(body.inssLaboral ?? 0),
      ir: String(body.ir ?? 0),
      deducVarias: String(body.deducVarias ?? 0),
      totalIngreso: String(body.totalIngreso ?? 0),
      totalDeducciones: String(body.totalDeducciones ?? 0),
      netoPagar: String(body.netoPagar ?? 0),
      reposoLaboral: body.reposoLaboral ?? false,
    };

    const [existing] = await db
      .select()
      .from(planillaDetalle)
      .where(
        and(
          eq(planillaDetalle.planillaId, planillaId),
          eq(planillaDetalle.trabajadorId, trabajadorId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(planillaDetalle)
        .set(data as any)
        .where(eq(planillaDetalle.id, existing.id));
    } else {
      await db.insert(planillaDetalle).values(data as any);
    }

    return successResponse({ saved: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al guardar", 500));
  }
};
