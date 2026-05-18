import type { trabajadores } from "@db/schemas";

export interface WorkerFilters {
  search?: string;
  activo?: boolean;
  tipo_contrato_id?: string;
  cargo_id?: string;
  page?: number;
  limit?: number;
}

export interface CreateWorkerDTO {
  nombre: string;
  apellidos: string;
  email: string;
  fechaEntrada: string;
  fechaSalida?: string | null;
  nacionalidadId: string;
  cedulaIdentidad: string;
  numeroInss: string;
  telefono: string;
  direccion?: string | null;
  saldoVacaciones?: string | number;
  tallaCamisaId: string;
  tallaPantalonId: string;
  tipoContratoId: string;
  cargoId: string;
  generoId: string;
  activo?: boolean;
  foto?: string | null;
}

export interface UpdateWorkerDTO {
  nombre?: string;
  apellidos?: string;
  email?: string;
  fechaEntrada?: string;
  fechaSalida?: string | null;
  nacionalidadId?: string;
  cedulaIdentidad?: string;
  numeroInss?: string;
  telefono?: string;
  direccion?: string | null;
  saldoVacaciones?: string | number;
  tallaCamisaId?: string;
  tallaPantalonId?: string;
  tipoContratoId?: string;
  cargoId?: string;
  generoId?: string;
  activo?: boolean;
  foto?: string | null;
}

export interface WorkerResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  fechaEntrada: string;
  fechaSalida: string | null;
  nacionalidadId: string;
  nombreNacionalidad?: string;
  cedulaIdentidad: string;
  numeroInss: string;
  telefono: string;
  direccion: string | null;
  saldoVacaciones: string | number;
  tallaCamisaId: string;
  nombreTallaCamisa?: string;
  tallaPantalonId: string;
  nombreTallaPantalon?: string;
  tipoContratoId: string;
  nombreTipoContrato?: string;
  cargoId: string;
  nombreCargo?: string;
  generoId: string;
  nombreGenero?: string;
  activo: boolean;
  foto: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  planillas?: Array<{
    id: string;
    nombre: string;
    tipo: string;
  }>;
}

export type WorkerRow = typeof trabajadores.$inferSelect;
