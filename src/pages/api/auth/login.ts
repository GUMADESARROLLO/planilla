import type { APIRoute } from "astro";
import { login } from "@modules/auth/services/auth.service";
import { loginSchema, validateSchema } from "@utils/validators";
import { successResponse, errorResponse } from "@utils/response";
import { ValidationError, UnauthorizedError } from "@utils/errors";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const data = validateSchema(loginSchema, body);
    const result = await login(data);
    return successResponse(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof UnauthorizedError) {
      return errorResponse(error);
    }
    return errorResponse(
      new UnauthorizedError("Correo electrónico o contraseña inválidos"),
    );
  }
};
