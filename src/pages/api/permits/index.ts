import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { validateSchema } from "@utils/validators";
import { successResponse, paginatedResponse, errorResponse } from "@utils/response";
import { ValidationError } from "@utils/errors";
import { z } from "zod";
import { EstadoPermiso } from "@modules/permits/types";
import * as permitsService from "@modules/permits/services/permits.service";

const createEsquelaSchema = z.object({
  trabajadorId: z.number().int().positive(),
  cargo: z.string().optional(),
  ubicacion: z.string().min(1, "La ubicación es requerida"),
  tipoPermisoId: z.number().int().positive(),
  cantidadDias: z.number().positive("La cantidad de días debe ser mayor a 0"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().min(1, "La fecha de fin es requerida"),
  periodoCorrespondiente: z.string().optional(),
  fechaIncorporacion: z.string().min(1, "La fecha de incorporación es requerida"),
  observaciones: z.string().optional(),
});

export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireAuth({ request, url } as any);

    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") ?? "10", 10),
      100,
    );
    const search = url.searchParams.get("search") ?? undefined;
    const estado = url.searchParams.get("estado") ?? undefined;
    const trabajadorIdParam = url.searchParams.get("trabajador_id");
    const trabajadorId = trabajadorIdParam ? Number(trabajadorIdParam) : undefined;

    const validEstados: string[] = Object.values(EstadoPermiso);
    const estadoFilter = estado && validEstados.includes(estado)
      ? (estado as EstadoPermiso)
      : undefined;

    const result = await permitsService.findAll({
      page,
      limit,
      search,
      estado: estadoFilter,
      trabajadorId,
    });

    return paginatedResponse(result.data, result.page, result.limit, result.total);
  } catch (error) {
    return errorResponse(
      error instanceof ValidationError
        ? error
        : new ValidationError("Error al listar esquelas de permisos"),
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await requireAuth({ request } as any);

    const body = await request.json().catch(() => ({}));
    const data = validateSchema(createEsquelaSchema, body);

    const result = await permitsService.create(data);
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error);
    }
    return errorResponse(
      new ValidationError("Error al crear la esquela de permiso"),
    );
  }
};
