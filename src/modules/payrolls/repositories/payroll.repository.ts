import { db } from "@db/index";
import { planillas, cargos, tiposPlanilla } from "@db/schemas/catalogs";
import { trabajadores } from "@db/schemas/workers";
import { trabajadoresPlanillas } from "@db/schemas/workers_planillas";
import { eq, like, and, or, desc, sql, count } from "drizzle-orm";
import type {
  CreatePlanillaDTO,
  UpdatePlanillaDTO,
  PlanillaResponse,
  PlanillaWithWorkers,
  WorkerInfo,
} from "../types";
import { NotFoundError } from "@utils/errors";

const TIPO_MAP: Record<number, string> = {
  1: "quincenal", 2: "mensual", 3: "vehicular",
  4: "administrativa", 5: "temporal",
};

function planillaRow(id: number, data: any): PlanillaResponse {
  return {
    id,
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    tipoPlanillaId: data.tipoPlanillaId,
    tipo: TIPO_MAP[data.tipoPlanillaId] ?? "",
    activo: data.activo ?? true,
    unidadNegocioId: data.unidadNegocioId ?? null,
    fechaDesde: data.fechaDesde ?? null,
    fechaHasta: data.fechaHasta ?? null,
    codigo: data.codigo ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
}

function mapPlanilla(row: Record<string, unknown>): PlanillaResponse {
  return {
    id: row["id"] as number,
    nombre: row["nombre"] as string,
    descripcion: (row["descripcion"] as string) ?? null,
    tipoPlanillaId: (row["tipoPlanillaId"] ?? row["tipo_planilla_id"] as number) ?? 0,
    tipo: (row["tipo"] ?? row["tipos_planilla_nombre"] ?? "") as string,
    activo: row["activo"] as boolean,
    unidadNegocioId: (row["unidad_negocio_id"] as number) ?? null,
    fechaDesde: (row["fechaDesde"] ?? row["fecha_desde"] as Date) ?? null,
    fechaHasta: (row["fechaHasta"] ?? row["fecha_hasta"] as Date) ?? null,
    codigo: (row["codigo"] as string) ?? null,
    createdAt: row["created_at"] as Date,
    updatedAt: row["updated_at"] as Date,
  };
}

export async function findAll(filters: {
  page: number;
  limit: number;
  search?: string;
  activo?: boolean;
}): Promise<{ data: PlanillaResponse[]; total: number }> {
  const { page, limit, search, activo } = filters;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(planillas.nombre, `%${search}%`),
        like(planillas.descripcion, `%${search}%`),
      ),
    );
  }

  if (activo !== undefined) {
    conditions.push(eq(planillas.activo, activo));
  }

  conditions.push(sql`${planillas.deleted_at} IS NULL`);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: planillas.id,
        nombre: planillas.nombre,
        descripcion: planillas.descripcion,
        tipoPlanillaId: planillas.tipoPlanillaId,
        tipo: tiposPlanilla.nombre,
        activo: planillas.activo,
        unidadNegocioId: planillas.unidadNegocioId,
        fechaDesde: planillas.fechaDesde,
        fechaHasta: planillas.fechaHasta,
        codigo: planillas.codigo,
        created_at: planillas.created_at,
        updated_at: planillas.updated_at,
        deleted_at: planillas.deleted_at,
      })
      .from(planillas)
      .leftJoin(tiposPlanilla, eq(planillas.tipoPlanillaId, tiposPlanilla.id))
      .where(whereClause)
      .orderBy(desc(planillas.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(planillas)
      .where(whereClause)
      .then((r) => r[0]!.total),
  ]);

  return {
    data: rows.map(mapPlanilla),
    total: Number(totalResult),
  };
}

export async function findById(id: number): Promise<PlanillaWithWorkers> {
  const [planilla] = await db
    .select({
      id: planillas.id,
      nombre: planillas.nombre,
      descripcion: planillas.descripcion,
      tipoPlanillaId: planillas.tipoPlanillaId,
      tipo: tiposPlanilla.nombre,
      activo: planillas.activo,
      unidadNegocioId: planillas.unidadNegocioId,
      fechaDesde: planillas.fechaDesde,
      fechaHasta: planillas.fechaHasta,
      codigo: planillas.codigo,
      created_at: planillas.created_at,
      updated_at: planillas.updated_at,
      deleted_at: planillas.deleted_at,
    })
    .from(planillas)
    .leftJoin(tiposPlanilla, eq(planillas.tipoPlanillaId, tiposPlanilla.id))
    .where(and(eq(planillas.id, id), sql`${planillas.deleted_at} IS NULL`))
    .limit(1);

  if (!planilla) {
    throw new NotFoundError("Planilla no encontrada", { id });
  }

  const wRows = await db
    .select({
      id: trabajadores.id,
      nombre: trabajadores.nombre,
      apellidos: trabajadores.apellidos,
      email: trabajadores.email,
      cedulaIdentidad: trabajadores.cedulaIdentidad,
      numeroInss: trabajadores.numeroInss,
      fechaEntrada: trabajadores.fechaEntrada,
      telefono: trabajadores.telefono,
      cargo: cargos.nombre,
      cuentaNomina: trabajadores.cuentaNomina,
      salarioBase: trabajadores.salarioBase,
      activo: trabajadores.activo,
    })
    .from(trabajadoresPlanillas)
    .innerJoin(trabajadores, eq(trabajadoresPlanillas.trabajadorId, trabajadores.id))
    .innerJoin(cargos, eq(trabajadores.cargoId, cargos.id))
    .where(eq(trabajadoresPlanillas.planillaId, id));

  return {
    ...mapPlanilla(planilla),
    workers: wRows as WorkerInfo[],
  };
}

export async function create(data: CreatePlanillaDTO): Promise<PlanillaResponse> {
  const [result] = await db
    .insert(planillas)
    .values({
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      tipoPlanillaId: data.tipoPlanillaId,
      unidadNegocioId: data.unidadNegocioId ?? null,
      fechaDesde: data.fechaDesde ? new Date(data.fechaDesde) : null,
      fechaHasta: data.fechaHasta ? new Date(data.fechaHasta) : null,
      codigo: data.codigo ?? null,
    } as any);

  return planillaRow(result.insertId, data);
}

export async function update(id: number, data: UpdatePlanillaDTO): Promise<PlanillaResponse> {
  const [existing] = await db
    .select()
    .from(planillas)
    .where(and(eq(planillas.id, id), sql`${planillas.deleted_at} IS NULL`))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Planilla no encontrada", { id });
  }

  const updateData: Record<string, unknown> = {};
  if (data.nombre !== undefined) updateData["nombre"] = data.nombre;
  if (data.descripcion !== undefined) updateData["descripcion"] = data.descripcion;
  if (data.tipoPlanillaId !== undefined) updateData["tipoPlanillaId"] = data.tipoPlanillaId;
  if (data.activo !== undefined) updateData["activo"] = data.activo;

  if (Object.keys(updateData).length > 0) {
    await db.update(planillas).set(updateData).where(eq(planillas.id, id));
  }

  const merged = { ...existing, ...updateData, id, updatedAt: new Date() };
  merged.tipo = TIPO_MAP[merged.tipoPlanillaId] ?? "";
  return mapPlanilla(merged);
}

export async function softDelete(id: number): Promise<void> {
  const result = await db
    .update(planillas)
    .set({ deleted_at: new Date(), activo: false })
    .where(and(eq(planillas.id, id), sql`${planillas.deleted_at} IS NULL`));

  if ((result as any)[0]?.affectedRows === 0) {
    throw new NotFoundError("Planilla no encontrada", { id });
  }
}

export async function assignWorker(trabajadorId: number, planillaId: number): Promise<void> {
  const [existing] = await db
    .select()
    .from(trabajadoresPlanillas)
    .where(
      and(
        eq(trabajadoresPlanillas.trabajadorId, trabajadorId),
        eq(trabajadoresPlanillas.planillaId, planillaId),
      ),
    )
    .limit(1);

  if (existing) return;

  await db.insert(trabajadoresPlanillas).values({
    trabajadorId,
    planillaId,
  });
}

export async function removeWorker(trabajadorId: number, planillaId: number): Promise<void> {
  await db
    .delete(trabajadoresPlanillas)
    .where(
      and(
        eq(trabajadoresPlanillas.trabajadorId, trabajadorId),
        eq(trabajadoresPlanillas.planillaId, planillaId),
      ),
    );
}

export async function getWorkersByPlanilla(planillaId: number): Promise<WorkerInfo[]> {
  const rows = await db
    .select({
      id: trabajadores.id,
      nombre: trabajadores.nombre,
      apellidos: trabajadores.apellidos,
      email: trabajadores.email,
      cedulaIdentidad: trabajadores.cedulaIdentidad,
      numeroInss: trabajadores.numeroInss,
      fechaEntrada: trabajadores.fechaEntrada,
      telefono: trabajadores.telefono,
      cargo: cargos.nombre,
      cuentaNomina: trabajadores.cuentaNomina,
      salarioBase: trabajadores.salarioBase,
      activo: trabajadores.activo,
    })
    .from(trabajadoresPlanillas)
    .innerJoin(trabajadores, eq(trabajadoresPlanillas.trabajadorId, trabajadores.id))
    .innerJoin(cargos, eq(trabajadores.cargoId, cargos.id))
    .where(eq(trabajadoresPlanillas.planillaId, planillaId));

  return rows as WorkerInfo[];
}
