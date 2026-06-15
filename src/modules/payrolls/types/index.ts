export interface CreatePlanillaDTO {
  nombre: string;
  descripcion?: string;
  tipo: "quincenal" | "mensual" | "vehicular" | "administrativa" | "temporal";
  unidadNegocioId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  codigo?: string | null;
}

export interface UpdatePlanillaDTO {
  nombre?: string;
  descripcion?: string;
  tipo?: "quincenal" | "mensual" | "vehicular" | "administrativa" | "temporal";
  activo?: boolean;
  unidadNegocioId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  codigo?: string | null;
}

export interface PlanillaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  activo: boolean;
  unidadNegocioId: number | null;
  fechaDesde: Date | string | null;
  fechaHasta: Date | string | null;
  codigo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerInfo {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  cedulaIdentidad: string;
  numeroInss: string;
  fechaEntrada: Date | string | null;
  telefono: string;
  cargo: string;
  salarioBase: string | number;
  activo: boolean;
}

export interface PlanillaWithWorkers extends PlanillaResponse {
  workers: WorkerInfo[];
}

export interface AssignWorkerDTO {
  trabajador_id: number;
  planilla_id: number;
}
