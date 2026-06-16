import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";
import { db } from "@db/index";
import { sql } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) return errorResponse(new AppError("ID requerido", 400));

    const trabajadorId = Number(id);
    const body = await context.request.json();
    const tipoPlanillaId = Number(body?.tipoPlanillaId);
    if (!tipoPlanillaId) return errorResponse(new AppError("tipoPlanillaId requerido", 400));

    // Check existing usando raw SQL con la tabla trabajadores_planillas
    const [rows] = await db.execute(
      sql`SELECT id FROM trabajadores_planillas
          WHERE trabajador_id = ${trabajadorId}
            AND tipo_planilla_id = ${tipoPlanillaId}
            AND planilla_id IS NULL
          LIMIT 1`
    );

    const existing = (rows as any[])[0];
    if (existing) {
      await db.execute(sql`DELETE FROM trabajadores_planillas WHERE id = ${existing.id}`);
      return successResponse({ attached: false });
    }

    await db.execute(
      sql`INSERT INTO trabajadores_planillas (trabajador_id, tipo_planilla_id)
          VALUES (${trabajadorId}, ${tipoPlanillaId})`
    );

    return successResponse({ attached: true });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar", 500));
  }
};
