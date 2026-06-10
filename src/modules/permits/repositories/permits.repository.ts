
import { and, eq, like, isNull, desc, count, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { esquelasPermisos } from "@/db/schemas/permits";
import { trabajadores } from "@/db/schemas/workers";
import { tiposPermisos, cargos } from "@/db/schemas/catalogs";
import { NotFoundError } from "@utils/errors";
import type {
  CreateEsquelaDTO,
  UpdateEsquelaDTO,
  EsquelaResponse,
  EsquelaFilters,
  PaginatedResult,
  EstadoPermiso,
} from "../types";

function mapEsquela(row: Record<string, unknown>): EsquelaResponse {
  return {
    id: row["id"] as number,
    fechaElaborada:
      row["fechaElaborada"] instanceof Date
        ? (row["fechaElaborada"] as Date).toISOString()
        : String(row["fechaElaborada"] ?? ""),
    trabajadorId: row["trabajadorId"] as number,
    trabajador: row["trabajador"]
      ? {
          id: (row["trabajador"] as Record<string, unknown>)["id"] as number,
          nombre: (row["trabajador"] as Record<string, unknown>)["nombre"] as string,
          apellidos: (row["trabajador"] as Record<string, unknown>)["apellidos"] as string,
          email: (row["trabajador"] as Record<string, unknown>)["email"] as string,
          cedulaIdentidad: (row["trabajador"] as Record<string, unknown>)["cedulaIdentidad"] as string,
          telefono: (row["trabajador"] as Record<string, unknown>)["telefono"] as string,
          cargo: (row["trabajador"] as Record<string, unknown>)["cargo"] as string,
        }
      : null,
    cargo: (row["cargo"] as string) ?? null,
    ubicacion: row["ubicacion"] as string,
    tipoPermisoId: row["tipoPermisoId"] as number,
    tipoPermiso: row["tipoPermiso"]
      ? {
          id: (row["tipoPermiso"] as Record<string, unknown>)["id"] as number,
          nombre: (row["tipoPermiso"] as Record<string, unknown>)["nombre"] as string,
          descripcion:
            ((row["tipoPermiso"] as Record<string, unknown>)["descripcion"] as string) ?? null,
        }
      : null,
    cantidadDias: row["cantidadDias"] as number,
    periodoCorrespondiente: row["periodoCorrespondiente"] as string,
    fechaIncorporacion: row["fechaIncorporacion"] as string,
    observaciones: (row["observaciones"] as string) ?? null,
    estado: row["estado"] as EstadoPermiso,
    aprobadoPor: (row["aprobadoPor"] as string) ?? null,
    nombreAprobador: (row["nombreAprobador"] as string) ?? null,
    firmaDigital: (row["firmaDigital"] as string) ?? null,
    createdAt:
      row["createdAt"] instanceof Date
        ? (row["createdAt"] as Date).toISOString()
        : (row["createdAt"] as string) ?? "",
    updatedAt:
      row["updatedAt"] instanceof Date
        ? (row["updatedAt"] as Date).toISOString()
        : (row["updatedAt"] as string) ?? "",
  };
}

const baseQuery = db
  .select({
    id: esquelasPermisos.id,
    fechaElaborada: esquelasPermisos.fechaElaborada,
    trabajadorId: esquelasPermisos.trabajadorId,
    trabajador: {
      id: trabajadores.id,
      nombre: trabajadores.nombre,
      apellidos: trabajadores.apellidos,
      email: trabajadores.email,
      cedulaIdentidad: trabajadores.cedulaIdentidad,
      telefono: trabajadores.telefono,
      cargo: cargos.nombre,
    },
    cargo: esquelasPermisos.cargo,
    ubicacion: esquelasPermisos.ubicacion,
    tipoPermisoId: esquelasPermisos.tipoPermisoId,
    tipoPermiso: {
      id: tiposPermisos.id,
      nombre: tiposPermisos.nombre,
      descripcion: tiposPermisos.descripcion,
    },
    cantidadDias: esquelasPermisos.cantidadDias,
    periodoCorrespondiente: esquelasPermisos.periodoCorrespondiente,
    fechaIncorporacion: esquelasPermisos.fechaIncorporacion,
    observaciones: esquelasPermisos.observaciones,
    estado: esquelasPermisos.estado,
    aprobadoPor: esquelasPermisos.aprobadoPor,
    nombreAprobador: sql<string>`(SELECT CONCAT(u.nombre, ' ', u.apellidos) FROM \`user\` u WHERE u.id = ${esquelasPermisos.aprobadoPor})`,
    firmaDigital: esquelasPermisos.firmaDigital,
    createdAt: esquelasPermisos.created_at,
    updatedAt: esquelasPermisos.updated_at,
  })
  .from(esquelasPermisos)
  .leftJoin(trabajadores, eq(esquelasPermisos.trabajadorId, trabajadores.id))
  .leftJoin(cargos, eq(trabajadores.cargoId, cargos.id))
  .leftJoin(tiposPermisos, eq(esquelasPermisos.tipoPermisoId, tiposPermisos.id))
  .where(isNull(esquelasPermisos.deleted_at))
  .$dynamic();

export async function findAll(
  filters: EsquelaFilters = {},
): Promise<PaginatedResult<EsquelaResponse>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof and>[] = [isNull(esquelasPermisos.deleted_at)];

  if (filters.estado) {
    conditions.push(eq(esquelasPermisos.estado, filters.estado));
  }

  if (filters.trabajadorId) {
    conditions.push(eq(esquelasPermisos.trabajadorId, filters.trabajadorId));
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(trabajadores.nombre, searchPattern),
        like(trabajadores.apellidos, searchPattern),
        sql`CONCAT(${trabajadores.nombre}, ' ', ${trabajadores.apellidos}) LIKE ${searchPattern}`,
      ),
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [countResult] = await db
    .select({ total: count() })
    .from(esquelasPermisos)
    .leftJoin(trabajadores, eq(esquelasPermisos.trabajadorId, trabajadores.id))
    .where(whereClause);

  const total = countResult?.total ?? 0;

  const rows = await baseQuery
    .where(whereClause)
    .orderBy(desc(esquelasPermisos.created_at))
    .limit(limit)
    .offset(offset);

  return {
    data: rows.map(mapEsquela),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findById(id: number): Promise<EsquelaResponse> {
  const whereClause = and(
    eq(esquelasPermisos.id, id),
    isNull(esquelasPermisos.deleted_at),
  );

  const [row] = await baseQuery.where(whereClause);

  if (!row) {
    throw new NotFoundError("Esquela de permiso no encontrada");
  }

  return mapEsquela(row);
}

export async function create(data: CreateEsquelaDTO): Promise<EsquelaResponse> {
  const [inserted] = await db.insert(esquelasPermisos).values({
    trabajadorId: data.trabajadorId,
    cargo: data.cargo ?? null,
    ubicacion: data.ubicacion,
    tipoPermisoId: data.tipoPermisoId,
    cantidadDias: data.cantidadDias,
    periodoCorrespondiente: data.periodoCorrespondiente,
    fechaIncorporacion: data.fechaIncorporacion,
    observaciones: data.observaciones ?? null,
    estado: "pendiente",
  } as any).$returningId();

  return findById(inserted!.id);
}

export async function update(
  id: number,
  data: UpdateEsquelaDTO,
): Promise<EsquelaResponse> {
  const existing = await findById(id);

  const updateData: Record<string, unknown> = {};
  if (data.cargo !== undefined) updateData["cargo"] = data.cargo;
  if (data.ubicacion !== undefined) updateData["ubicacion"] = data.ubicacion;
  if (data.tipoPermisoId !== undefined) updateData["tipoPermisoId"] = data.tipoPermisoId;
  if (data.cantidadDias !== undefined) updateData["cantidadDias"] = data.cantidadDias;
  if (data.periodoCorrespondiente !== undefined)
    updateData["periodoCorrespondiente"] = data.periodoCorrespondiente;
  if (data.fechaIncorporacion !== undefined)
    updateData["fechaIncorporacion"] = data.fechaIncorporacion;
  if (data.observaciones !== undefined) updateData["observaciones"] = data.observaciones;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(esquelasPermisos)
      .set(updateData)
      .where(eq(esquelasPermisos.id, id));
  }

  return findById(id);
}

export async function softDelete(id: number): Promise<void> {
  const existing = await findById(id);

  await db
    .update(esquelasPermisos)
    .set({ deleted_at: new Date() })
    .where(eq(esquelasPermisos.id, id));
}

export async function approve(
  id: number,
  aprobadoPor: string,
  firmaDigital?: string,
): Promise<EsquelaResponse> {
  const existing = await findById(id);

  const updateData: Record<string, unknown> = {
    estado: "aprobada",
    aprobadoPor,
  };

  if (firmaDigital !== undefined) {
    updateData["firmaDigital"] = firmaDigital;
  }

  await db
    .update(esquelasPermisos)
    .set(updateData)
    .where(eq(esquelasPermisos.id, id));

  return findById(id);
}

export async function reject(
  id: number,
  aprobadoPor: string,
): Promise<EsquelaResponse> {
  const existing = await findById(id);

  await db
    .update(esquelasPermisos)
    .set({
      estado: "rechazada",
      aprobadoPor,
    })
    .where(eq(esquelasPermisos.id, id));

  return findById(id);
}

export async function findByWorker(
  trabajadorId: number,
): Promise<EsquelaResponse[]> {
  const rows = await baseQuery
    .where(
      and(
        eq(esquelasPermisos.trabajadorId, trabajadorId),
        isNull(esquelasPermisos.deleted_at),
      ),
    )
    .orderBy(desc(esquelasPermisos.created_at));

  return rows.map(mapEsquela);
}
