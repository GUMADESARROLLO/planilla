import { db, schemas } from "@db/index";
import {
  count,
  eq,
  and,
  isNull,
  desc,
  sql,
} from "drizzle-orm";

export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  totalPayrolls: number;
  pendingPermits: number;
  approvedPermits: number;
  rejectedPermits: number;
  workersByGender: { nombre: string; count: number }[];
  vacacionesByUnidad: {
    unidadNegocio: string;
    departamento: string;
    totalVacaciones: number;
    workerCount: number;
  }[];
}

export interface RecentWorker {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  activo: boolean;
  created_at: Date | string;
}

export interface RecentPermit {
  id: number;
  trabajadorId: number;
  tipoPermisoId: number;
  cantidadDias: number;
  estado: string;
  fechaElaborada: Date | string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const [
      [totalWorkers],
      [activeWorkers],
      [totalPayrolls],
      [pendingPermits],
      [approvedPermits],
      [rejectedPermits],
      workersByGender,
      vacacionesByUnidad,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(schemas.trabajadores)
        .where(isNull(schemas.trabajadores.deleted_at))
        .execute(),
      db
        .select({ value: count() })
        .from(schemas.trabajadores)
        .where(
          and(
            eq(schemas.trabajadores.activo, true),
            isNull(schemas.trabajadores.deleted_at),
          ),
        )
        .execute(),
      db
        .select({ value: count() })
        .from(schemas.planillas)
        .where(isNull(schemas.planillas.deleted_at))
        .execute(),
      db
        .select({ value: count() })
        .from(schemas.esquelasPermisos)
        .where(eq(schemas.esquelasPermisos.estado, "pendiente"))
        .execute(),
      db
        .select({ value: count() })
        .from(schemas.esquelasPermisos)
        .where(eq(schemas.esquelasPermisos.estado, "aprobada"))
        .execute(),
      db
        .select({ value: count() })
        .from(schemas.esquelasPermisos)
        .where(eq(schemas.esquelasPermisos.estado, "rechazada"))
        .execute(),
      db
        .select({
          nombre: schemas.generos.nombre,
          count: count(),
        })
        .from(schemas.trabajadores)
        .innerJoin(
          schemas.generos,
          eq(schemas.trabajadores.generoId, schemas.generos.id),
        )
        .where(isNull(schemas.trabajadores.deleted_at))
        .groupBy(schemas.generos.nombre)
        .execute(),
      db
        .select({
          unidadNegocio: schemas.unidadesNegocio.nombre,
          departamento: schemas.departamentos.nombre,
          totalVacaciones: sql<string>`COALESCE(SUM(${schemas.trabajadores.saldoVacaciones}), 0)`,
          workerCount: count(),
        })
        .from(schemas.trabajadores)
        .innerJoin(
          schemas.cargos,
          eq(schemas.trabajadores.cargoId, schemas.cargos.id),
        )
        .innerJoin(
          schemas.departamentos,
          eq(schemas.cargos.departamentoId, schemas.departamentos.id),
        )
        .innerJoin(
          schemas.unidadesNegocio,
          eq(schemas.departamentos.unidadNegocioId, schemas.unidadesNegocio.id),
        )
        .where(isNull(schemas.trabajadores.deleted_at))
        .groupBy(schemas.unidadesNegocio.nombre, schemas.departamentos.nombre)
        .orderBy(schemas.unidadesNegocio.nombre, schemas.departamentos.nombre)
        .execute(),
    ]);

    return {
      totalWorkers: Number(totalWorkers?.value ?? 0),
      activeWorkers: Number(activeWorkers?.value ?? 0),
      totalPayrolls: Number(totalPayrolls?.value ?? 0),
      pendingPermits: Number(pendingPermits?.value ?? 0),
      approvedPermits: Number(approvedPermits?.value ?? 0),
      rejectedPermits: Number(rejectedPermits?.value ?? 0),
      workersByGender: workersByGender as { nombre: string; count: number }[],
      vacacionesByUnidad: (vacacionesByUnidad as any[]).map((v: any) => ({
        unidadNegocio: v.unidadNegocio,
        departamento: v.departamento,
        totalVacaciones: Number(v.totalVacaciones),
        workerCount: Number(v.workerCount),
      })),
    };
  }

  async getRecentWorkers(limit = 5): Promise<RecentWorker[]> {
    const data = await db
      .select()
      .from(schemas.trabajadores)
      .where(isNull(schemas.trabajadores.deleted_at))
      .orderBy(desc(schemas.trabajadores.created_at))
      .limit(limit)
      .execute();
    return data as unknown as RecentWorker[];
  }

  async getRecentPendingPermits(limit = 5): Promise<RecentPermit[]> {
    const data = await db
      .select()
      .from(schemas.esquelasPermisos)
      .where(eq(schemas.esquelasPermisos.estado, "pendiente"))
      .orderBy(desc(schemas.esquelasPermisos.created_at))
      .limit(limit)
      .execute();
    return data as unknown as RecentPermit[];
  }
}

export const dashboardService = new DashboardService();
