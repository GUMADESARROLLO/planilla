import { z, type ZodSchema } from "zod";
import { ValidationError } from "./errors";

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError("Validation failed", { issues });
  }
  return result.data;
}

export const emailSchema = z
  .string()
  .email("Correo electrónico inválido")
  .max(255, "El correo no puede exceder 255 caracteres")
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede exceder 128 caracteres");

export const uuidSchema = z.string().uuid("UUID inválido");

export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Formato de fecha inválido (YYYY-MM-DD)",
);

export const isoDateSchema = z.string().datetime({ offset: true });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});
