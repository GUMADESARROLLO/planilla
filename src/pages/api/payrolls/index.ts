import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import * as payrollService from "@modules/payrolls/services/payroll.service";
import { successResponse, paginatedResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const search = url.searchParams.get("search") ?? undefined;
    const activoParam = url.searchParams.get("activo");
    const activo = activoParam !== null ? activoParam === "true" : undefined;

    const result = await payrollService.findAll({ page, limit, search, activo });
    return paginatedResponse(result.data, page, limit, result.total);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al listar planillas", 500, "INTERNAL_ERROR"));
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const body = await context.request.json().catch(() => ({}));
    const planilla = await payrollService.create(body);
    return successResponse(planilla);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al crear planilla", 500, "INTERNAL_ERROR"));
  }
};
