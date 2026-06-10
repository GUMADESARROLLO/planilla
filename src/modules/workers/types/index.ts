import type { trabajadores } from "@db/schemas";

export interface WorkerFilters {
  search?: string;
  activo?: boolean;
  tipo_contrato_id?: number;
  cargo_id?: number;
  page?: number;
  limit?: number;
}

export interface CreateWorkerDTO {
  nombre: string;
  apellidos: string;
  email: string;
  fechaEntrada: string;
  fechaSalida?: string | null;
  nacionalidadId: number;
  cedulaIdentidad: string;
  numeroInss: string;
  telefono: string;
  direccion?: string | null;
  saldoVacaciones?: string | number;
  tallaCamisaId: number;
  tallaPantalonId: number;
  tipoContratoId: number;
  cargoId: number;
  generoId: number;
  activo?: boolean;
  foto?: string | null;
}

export interface UpdateWorkerDTO {
  nombre?: string;
  apellidos?: string;
  email?: string;
  fechaEntrada?: string;
  fechaSalida?: string | null;
  nacionalidadId?: number;
  cedulaIdentidad?: string;
  numeroInss?: string;
  telefono?: string;
  direccion?: string | null;
  saldoVacaciones?: string | number;
  tallaCamisaId?: number;
  tallaPantalonId?: number;
  tipoContratoId?: number;
  cargoId?: number;
  generoId?: number;
  activo?: boolean;
  foto?: string | null;
}

export interface WorkerResponse {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  fechaEntrada: string;
  fechaSalida: string | null;
  nacionalidadId: number;
  nombreNacionalidad?: string;
  cedulaIdentidad: string;
  numeroInss: string;
  telefono: string;
  direccion: string | null;
  saldoVacaciones: string | number;
  tallaCamisaId: number;
  nombreTallaCamisa?: string;
  tallaPantalonId: number;
  nombreTallaPantalon?: string;
  tipoContratoId: number;
  nombreTipoContrato?: string;
  cargoId: number;
  nombreCargo?: string;
  nombreDepartamento?: string;
  nombreUnidad?: string;
  generoId: number;
  nombreGenero?: string;
  activo: boolean;
  foto: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  planillas?: Array<{
    id: number;
    nombre: string;
    tipo: string;
  }>;
}

export type WorkerRow = typeof trabajadores.$inferSelect;
