import { db } from "@db/index";
import {
  trabajadores,
  nacionalidades,
  tallasCamisa,
  tallasPantalon,
  tiposContrato,
  cargos,
  generos,
  planillas,
  trabajadoresPlanillas,
} from "@db/schemas";
import { eq, like, and, isNull, or, sql, type SQL } from "drizzle-orm";
import { NotFoundError, ValidationError } from "@utils/errors";
import type {
  CreateWorkerDTO,
  UpdateWorkerDTO,
  WorkerFilters,
  WorkerResponse,
} from "../types";

const workerWithRelations = {
  with: {
    nacionalidad: true as const,
    tallaCamisa: true as const,
    tallaPantalon: true as const,
    tipoContrato: true as const,
    cargo: true as const,
    genero: true as const,
    planillas: {
      with: {
        planilla: true as const,
      },
    },
  },
};

function mapWorker(row: any): WorkerResponse {
  return {
    id: row.id,
    nombre: row.nombre,
    apellidos: row.apellidos,
    email: row.email,
    fechaEntrada: row.fechaEntrada,
    fechaSalida: row.fechaSalida ?? null,
    nacionalidadId: row.nacionalidadId,
    nombreNacionalidad: row.nacionalidad?.nombre,
    cedulaIdentidad: row.cedulaIdentidad,
    numeroInss: row.numeroInss,
    telefono: row.telefono,
    direccion: row.direccion ?? null,
    saldoVacaciones: row.saldoVacaciones,
    tallaCamisaId: row.tallaCamisaId,
    nombreTallaCamisa: row.tallaCamisa?.nombre,
    tallaPantalonId: row.tallaPantalonId,
    nombreTallaPantalon: row.tallaPantalon?.nombre,
    tipoContratoId: row.tipoContratoId,
    nombreTipoContrato: row.tipoContrato?.nombre,
    cargoId: row.cargoId,
    nombreCargo: row.cargo?.nombre,
    generoId: row.generoId,
    nombreGenero: row.genero?.nombre,
    activo: row.activo,
    foto: row.foto ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
    planillas:
      row.planillas?.map((tp: any) => ({
        id: tp.planilla.id,
        nombre: tp.planilla.nombre,
        tipo: tp.planilla.tipo,
      })) ?? [],
  };
}

function buildWhereClause(filters: WorkerFilters): SQL | undefined {
  const conditions: SQL[] = [];

  conditions.push(isNull(trabajadores.deleted_at));

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(trabajadores.nombre, term),
        like(trabajadores.apellidos, term),
        like(trabajadores.email, term),
        like(trabajadores.cedulaIdentidad, term),
        like(trabajadores.numeroInss, term),
      )!,
    );
  }

  if (filters.activo !== undefined && filters.activo !== null) {
    conditions.push(eq(trabajadores.activo, filters.activo));
  }

  if (filters.tipo_contrato_id) {
    conditions.push(eq(trabajadores.tipoContratoId, filters.tipo_contrato_id));
  }

  if (filters.cargo_id) {
    conditions.push(eq(trabajadores.cargoId, filters.cargo_id));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function findAll(
  filters: WorkerFilters,
): Promise<{
  data: WorkerResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;
  const where = buildWhereClause(filters);

  const [rows, countResult] = await Promise.all([
    db.query.trabajadores.findMany({
      where,
      ...workerWithRelations,
      orderBy: (trabajadores, { desc }) => [desc(trabajadores.created_at)],
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(trabajadores)
      .where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return { data: rows.map(mapWorker), total, page, limit };
}

export async function findById(id: string): Promise<WorkerResponse> {
  const row = await db.query.trabajadores.findFirst({
    where: and(eq(trabajadores.id, id), isNull(trabajadores.deleted_at)),
    ...workerWithRelations,
  });

  if (!row) {
    throw new NotFoundError("Trabajador no encontrado");
  }

  return mapWorker(row);
}

async function checkDuplicate(
  field: "email" | "numeroInss" | "cedulaIdentidad",
  value: string,
  excludeId?: string,
): Promise<void> {
  const column =
    field === "email"
      ? trabajadores.email
      : field === "numeroInss"
        ? trabajadores.numeroInss
        : trabajadores.cedulaIdentidad;

  const conditions: SQL[] = [eq(column, value), isNull(trabajadores.deleted_at)];
  if (excludeId) {
    conditions.push(sql`${trabajadores.id} != ${excludeId}`);
  }

  const existing = await db
    .select({ id: trabajadores.id })
    .from(trabajadores)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    const labels: Record<string, string> = {
      email: "correo electrónico",
      numeroInss: "número INSS",
      cedulaIdentidad: "cédula de identidad",
    };
    throw new ValidationError(
      `Ya existe un trabajador con este ${labels[field] ?? field}`,
    );
  }
}

export async function create(data: CreateWorkerDTO): Promise<WorkerResponse> {
  await Promise.all([
    checkDuplicate("email", data.email),
    checkDuplicate("numeroInss", data.numeroInss),
    checkDuplicate("cedulaIdentidad", data.cedulaIdentidad),
  ]);

  const id = crypto.randomUUID();

  await db.insert(trabajadores).values({
    id,
    nombre: data.nombre,
    apellidos: data.apellidos,
    email: data.email.toLowerCase().trim(),
    fechaEntrada: data.fechaEntrada,
    fechaSalida: data.fechaSalida ?? null,
    nacionalidadId: data.nacionalidadId,
    cedulaIdentidad: data.cedulaIdentidad.trim(),
    numeroInss: data.numeroInss.trim(),
    telefono: data.telefono.trim(),
    direccion: data.direccion ?? null,
    saldoVacaciones: String(data.saldoVacaciones ?? "0.00"),
    tallaCamisaId: data.tallaCamisaId,
    tallaPantalonId: data.tallaPantalonId,
    tipoContratoId: data.tipoContratoId,
    cargoId: data.cargoId,
    generoId: data.generoId,
    activo: data.activo ?? true,
    foto: data.foto ?? null,
  } as any);

  return findById(id);
}

export async function update(
  id: string,
  data: UpdateWorkerDTO,
): Promise<WorkerResponse> {
  const existing = await findById(id);

  const checks: Promise<void>[] = [];
  if (data.email && data.email.toLowerCase().trim() !== existing.email) {
    checks.push(checkDuplicate("email", data.email, id));
  }
  if (data.numeroInss && data.numeroInss.trim() !== existing.numeroInss) {
    checks.push(checkDuplicate("numeroInss", data.numeroInss, id));
  }
  if (
    data.cedulaIdentidad &&
    data.cedulaIdentidad.trim() !== existing.cedulaIdentidad
  ) {
    checks.push(checkDuplicate("cedulaIdentidad", data.cedulaIdentidad, id));
  }
  if (checks.length > 0) {
    await Promise.all(checks);
  }

  const updateData: Record<string, unknown> = {};
  if (data.nombre !== undefined) updateData["nombre"] = data.nombre;
  if (data.apellidos !== undefined) updateData["apellidos"] = data.apellidos;
  if (data.email !== undefined)
    updateData["email"] = data.email.toLowerCase().trim();
  if (data.fechaEntrada !== undefined)
    updateData["fechaEntrada"] = data.fechaEntrada;
  if (data.fechaSalida !== undefined)
    updateData["fechaSalida"] = data.fechaSalida;
  if (data.nacionalidadId !== undefined)
    updateData["nacionalidadId"] = data.nacionalidadId;
  if (data.cedulaIdentidad !== undefined)
    updateData["cedulaIdentidad"] = data.cedulaIdentidad.trim();
  if (data.numeroInss !== undefined)
    updateData["numeroInss"] = data.numeroInss.trim();
  if (data.telefono !== undefined)
    updateData["telefono"] = data.telefono.trim();
  if (data.direccion !== undefined) updateData["direccion"] = data.direccion;
  if (data.saldoVacaciones !== undefined)
    updateData["saldoVacaciones"] = String(data.saldoVacaciones);
  if (data.tallaCamisaId !== undefined)
    updateData["tallaCamisaId"] = data.tallaCamisaId;
  if (data.tallaPantalonId !== undefined)
    updateData["tallaPantalonId"] = data.tallaPantalonId;
  if (data.tipoContratoId !== undefined)
    updateData["tipoContratoId"] = data.tipoContratoId;
  if (data.cargoId !== undefined) updateData["cargoId"] = data.cargoId;
  if (data.generoId !== undefined) updateData["generoId"] = data.generoId;
  if (data.activo !== undefined) updateData["activo"] = data.activo;
  if (data.foto !== undefined) updateData["foto"] = data.foto;

  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  await db
    .update(trabajadores)
    .set(updateData)
    .where(eq(trabajadores.id, id));

  return findById(id);
}

export async function softDelete(id: string): Promise<void> {
  await findById(id);

  await db
    .update(trabajadores)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(trabajadores.id, id));
}

export async function search(query: string): Promise<WorkerResponse[]> {
  const term = `%${query}%`;
  const rows = await db.query.trabajadores.findMany({
    where: and(
      isNull(trabajadores.deleted_at),
      or(
        like(trabajadores.nombre, term),
        like(trabajadores.apellidos, term),
        like(trabajadores.email, term),
        like(trabajadores.cedulaIdentidad, term),
        like(trabajadores.numeroInss, term),
      )!,
    ),
    ...workerWithRelations,
    limit: 20,
  });

  return rows.map(mapWorker);
}
