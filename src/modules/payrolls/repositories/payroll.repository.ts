import { db } from "@db/index";
import { planillas, cargos } from "@db/schemas/catalogs";
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

function mapPlanilla(row: typeof planillas.$inferSelect): PlanillaResponse {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    tipo: row.tipo,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      .select()
      .from(planillas)
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
    .select()
    .from(planillas)
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
      cargo: cargos.nombre,
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
  const [inserted] = await db
    .insert(planillas)
    .values({
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      tipo: data.tipo,
    })
    .$returningId();

  const [created] = await db
    .select()
    .from(planillas)
    .where(eq(planillas.id, inserted!.id))
    .limit(1);

  return mapPlanilla(created!);
}

export async function update(id: number, data: UpdatePlanillaDTO): Promise<PlanillaResponse> {
  const [existing] = await db
    .select({ id: planillas.id })
    .from(planillas)
    .where(and(eq(planillas.id, id), sql`${planillas.deleted_at} IS NULL`))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Planilla no encontrada", { id });
  }

  const updateData: Record<string, unknown> = {};
  if (data.nombre !== undefined) updateData["nombre"] = data.nombre;
  if (data.descripcion !== undefined) updateData["descripcion"] = data.descripcion;
  if (data.tipo !== undefined) updateData["tipo"] = data.tipo;
  if (data.activo !== undefined) updateData["activo"] = data.activo;

  if (Object.keys(updateData).length > 0) {
    await db.update(planillas).set(updateData).where(eq(planillas.id, id));
  }

  const [updated] = await db
    .select()
    .from(planillas)
    .where(eq(planillas.id, id))
    .limit(1);

  return mapPlanilla(updated!);
}

export async function softDelete(id: number): Promise<void> {
  const [existing] = await db
    .select({ id: planillas.id })
    .from(planillas)
    .where(and(eq(planillas.id, id), sql`${planillas.deleted_at} IS NULL`))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Planilla no encontrada", { id });
  }

  await db
    .update(planillas)
    .set({ deleted_at: new Date(), activo: false })
    .where(eq(planillas.id, id));
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
      cargo: cargos.nombre,
      activo: trabajadores.activo,
    })
    .from(trabajadoresPlanillas)
    .innerJoin(trabajadores, eq(trabajadoresPlanillas.trabajadorId, trabajadores.id))
    .innerJoin(cargos, eq(trabajadores.cargoId, cargos.id))
    .where(eq(trabajadoresPlanillas.planillaId, planillaId));

  return rows as WorkerInfo[];
}
