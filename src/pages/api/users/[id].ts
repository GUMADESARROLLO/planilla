import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { successResponse, errorResponse } from "@utils/response";
import { AppError, NotFoundError } from "@utils/errors";
import { validateSchema } from "@utils/validators";
import { z } from "zod";
import * as userService from "@modules/users/services/user.service";

const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  name: z.string().min(1, "El nombre es requerido").max(255).optional(),
  role: z.string().optional(),
  activo: z.boolean().optional(),
  nombre: z.string().optional(),
  apellidos: z.string().optional(),
});

export const GET: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) throw new AppError("ID requerido", 400);

    const user = await userService.findById(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");

    return successResponse(user);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al obtener usuario", 500));
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) throw new AppError("ID requerido", 400);

    const body = await context.request.json().catch(() => ({}));
    const data = validateSchema(updateUserSchema, body);

    const user = await userService.update(id, data);
    if (!user) throw new NotFoundError("Usuario no encontrado");

    return successResponse(user);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al actualizar usuario", 500));
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    await requireAuth(context);

    const { id } = context.params;
    if (!id) throw new AppError("ID requerido", 400);

    const deleted = await userService.softDelete(id);
    if (!deleted) throw new NotFoundError("Usuario no encontrado");

    return successResponse({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al desactivar usuario", 500));
  }
};
