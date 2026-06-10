import { z } from "zod";
import { emailSchema, dateStringSchema } from "@utils/validators";

export const createWorkerSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),
  apellidos: z
    .string()
    .min(1, "Los apellidos son requeridos")
    .max(255, "Los apellidos no pueden exceder 255 caracteres")
    .trim(),
  email: emailSchema,
  fechaEntrada: dateStringSchema,
  fechaSalida: dateStringSchema.nullable().optional(),
  nacionalidadId: z.number().int().positive(),
  cedulaIdentidad: z
    .string()
    .min(1, "La cédula de identidad es requerida")
    .max(50, "La cédula no puede exceder 50 caracteres")
    .trim(),
  numeroInss: z
    .string()
    .min(1, "El número INSS es requerido")
    .max(50, "El número INSS no puede exceder 50 caracteres")
    .trim(),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(50, "El teléfono no puede exceder 50 caracteres")
    .regex(
      /^[+]?[\d\s()-]{7,}$/,
      "Formato de teléfono inválido"
    ),
  direccion: z.string().nullable().optional(),
  saldoVacaciones: z
    .union([z.string(), z.number()])
    .optional()
    .default("0.00"),
  tallaCamisaId: z.number().int().positive(),
  tallaPantalonId: z.number().int().positive(),
  tipoContratoId: z.number().int().positive(),
  cargoId: z.number().int().positive(),
  generoId: z.number().int().positive(),
  activo: z.boolean().optional().default(true),
  foto: z.string().nullable().optional(),
});

export const updateWorkerSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim()
    .optional(),
  apellidos: z
    .string()
    .min(1, "Los apellidos son requeridos")
    .max(255, "Los apellidos no pueden exceder 255 caracteres")
    .trim()
    .optional(),
  email: emailSchema.optional(),
  fechaEntrada: dateStringSchema.optional(),
  fechaSalida: dateStringSchema.nullable().optional(),
  nacionalidadId: z.number().int().positive().optional(),
  cedulaIdentidad: z
    .string()
    .min(1, "La cédula de identidad es requerida")
    .max(50, "La cédula no puede exceder 50 caracteres")
    .trim()
    .optional(),
  numeroInss: z
    .string()
    .min(1, "El número INSS es requerido")
    .max(50, "El número INSS no puede exceder 50 caracteres")
    .trim()
    .optional(),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(50, "El teléfono no puede exceder 50 caracteres")
    .regex(
      /^[+]?[\d\s()-]{7,}$/,
      "Formato de teléfono inválido"
    )
    .optional(),
  direccion: z.string().nullable().optional(),
  saldoVacaciones: z.union([z.string(), z.number()]).optional(),
  tallaCamisaId: z.number().int().positive().optional(),
  tallaPantalonId: z.number().int().positive().optional(),
  tipoContratoId: z.number().int().positive().optional(),
  cargoId: z.number().int().positive().optional(),
  generoId: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
  foto: z.string().nullable().optional(),
});

export const workerFiltersSchema = z.object({
  search: z.string().optional(),
  activo: z
    .preprocess((v) => {
      if (v === "true" || v === true) return true;
      if (v === "false" || v === false) return false;
      return undefined;
    }, z.boolean().optional()),
  tipo_contrato_id: z.coerce.number().int().positive().optional(),
  cargo_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type WorkerFiltersInput = z.infer<typeof workerFiltersSchema>;
