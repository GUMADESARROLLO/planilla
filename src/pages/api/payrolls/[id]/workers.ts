import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import * as payrollService from "@modules/payrolls/services/payroll.service";
import { successResponse, errorResponse } from "@utils/response";
import { AppError, ValidationError } from "@utils/errors";

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);
    const { id } = context.params;
    if (!id) {
      return errorResponse(new AppError("ID de planilla requerido", 400, "VALIDATION_ERROR"));
    }

    const body = await context.request.json().catch(() => ({}));
    if (!body.trabajador_id) {
      return errorResponse(new ValidationError("ID de trabajador requerido"));
    }

    await payrollService.assignWorker(Number(body.trabajador_id), Number(id));
    return successResponse({ message: "Trabajador asignado correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al asignar trabajador", 500, "INTERNAL_ERROR"));
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAuth(context);
    const { id } = context.params;
    if (!id) {
      return errorResponse(new AppError("ID de planilla requerido", 400, "VALIDATION_ERROR"));
    }

    const body = await context.request.json().catch(() => ({}));
    if (!body.trabajador_id) {
      return errorResponse(new ValidationError("ID de trabajador requerido"));
    }

    await payrollService.removeWorker(Number(body.trabajador_id), Number(id));
    return successResponse({ message: "Trabajador removido correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al remover trabajador", 500, "INTERNAL_ERROR"));
  }
};
