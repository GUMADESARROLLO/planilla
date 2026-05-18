import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import * as payrollService from "@modules/payrolls/services/payroll.service";
import { successResponse, errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);
    const { id } = context.params;
    if (!id) {
      return errorResponse(new AppError("ID de planilla requerido", 400, "VALIDATION_ERROR"));
    }
    const planilla = await payrollService.findById(id);
    return successResponse(planilla);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al obtener planilla", 500, "INTERNAL_ERROR"));
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    await requireAuth(context);
    const { id } = context.params;
    if (!id) {
      return errorResponse(new AppError("ID de planilla requerido", 400, "VALIDATION_ERROR"));
    }
    const body = await context.request.json().catch(() => ({}));
    const planilla = await payrollService.update(id, body);
    return successResponse(planilla);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar planilla", 500, "INTERNAL_ERROR"));
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAuth(context);
    const { id } = context.params;
    if (!id) {
      return errorResponse(new AppError("ID de planilla requerido", 400, "VALIDATION_ERROR"));
    }
    await payrollService.softDelete(id);
    return successResponse({ message: "Planilla eliminada correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al eliminar planilla", 500, "INTERNAL_ERROR"));
  }
};
