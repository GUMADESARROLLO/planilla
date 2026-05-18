export interface CreatePlanillaDTO {
  nombre: string;
  descripcion?: string;
  tipo: "quincenal" | "mensual" | "vehicular" | "administrativa" | "temporal";
}

export interface UpdatePlanillaDTO {
  nombre?: string;
  descripcion?: string;
  tipo?: "quincenal" | "mensual" | "vehicular" | "administrativa" | "temporal";
  activo?: boolean;
}

export interface PlanillaResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerInfo {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  cargo: string;
  activo: boolean;
}

export interface PlanillaWithWorkers extends PlanillaResponse {
  workers: WorkerInfo[];
}

export interface AssignWorkerDTO {
  trabajador_id: string;
  planilla_id: string;
}
