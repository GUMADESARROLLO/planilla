import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, paginatedResponse, errorResponse } from "@utils/response";
import { AppError, ValidationError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { z } from "zod";
import * as userService from "@modules/users/services/user.service";

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "El nombre es requerido").max(255),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(128),
  role: z.string().optional().default("USER"),
  activo: z.boolean().optional().default(true),
  nombre: z.string().optional(),
  apellidos: z.string().optional(),
});

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const url = context.url;
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
    const search = url.searchParams.get("search") ?? undefined;

    const result = await userService.findAll({ page, limit, search });
    return paginatedResponse(result.data, result.page, result.limit, result.total);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al listar usuarios", 500));
  }
};

export const POST: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(createUserSchema, body);
    const user = await userService.create(data);

    return successResponse(user);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al crear usuario", 500));
  }
};
