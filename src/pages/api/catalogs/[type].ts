import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { catalogService } from "@modules/catalogs/services/catalog.service";
import { successResponse, paginatedResponse, errorResponse } from "@utils/response";
import { AppError, ValidationError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { z } from "zod";

const createCatalogSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional().nullable(),
  activo: z.boolean().optional().default(true),
});

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const type = context.params["type"];
    if (!type || !catalogService.getCatalogConfig(type)) {
      throw new AppError("Tipo de catálogo no válido", 400, "INVALID_CATALOG_TYPE");
    }

    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const search = url.searchParams.get("search") ?? undefined;
    const activoParam = url.searchParams.get("activo");
    const activo = activoParam !== null ? activoParam === "true" : undefined;

    const result = await catalogService.findAll(type, { page, limit, search, activo });
    return paginatedResponse(result.data, page, limit, result.total);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al listar catálogo", 500, "INTERNAL_ERROR"));
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const type = context.params["type"];
    if (!type || !catalogService.getCatalogConfig(type)) {
      throw new AppError("Tipo de catálogo no válido", 400, "INVALID_CATALOG_TYPE");
    }

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(createCatalogSchema, body);

    const entry = await catalogService.create(type, {
      id: crypto.randomUUID(),
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      activo: data.activo,
    });

    return successResponse(entry);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al crear entrada", 500, "INTERNAL_ERROR"));
  }
};
