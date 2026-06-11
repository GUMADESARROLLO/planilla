export enum EstadoPermiso {
  PENDIENTE = "pendiente",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
}

export interface CreateEsquelaDTO {
  trabajadorId: number;
  cargo?: string;
  ubicacion: string;
  tipoPermisoId: number;
  cantidadDias: number;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  periodoCorrespondiente?: string;
  fechaIncorporacion: string;
  observaciones?: string;
}

export interface UpdateEsquelaDTO {
  cargo?: string;
  ubicacion?: string;
  tipoPermisoId?: number;
  cantidadDias?: number;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  periodoCorrespondiente?: string;
  fechaIncorporacion?: string;
  observaciones?: string;
}

export interface EsquelaResponse {
  id: number;
  fechaElaborada: string;
  trabajadorId: number;
  trabajador?: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    cedulaIdentidad: string;
    telefono: string;
    cargo: string;
  } | null;
  cargo: string | null;
  ubicacion: string;
  tipoPermisoId: number;
  tipoPermiso?: {
    id: number;
    nombre: string;
    descripcion: string | null;
  } | null;
  cantidadDias: string;
  fechaInicio: string;
  fechaFin: string;
  periodoCorrespondiente: string;
  fechaIncorporacion: string;
  observaciones: string | null;
  estado: EstadoPermiso;
  aprobadoPor: string | null;
  nombreAprobador?: string | null;
  firmaDigital: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EsquelaFilters {
  page?: number;
  limit?: number;
  search?: string;
  estado?: EstadoPermiso;
  trabajadorId?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApproveDTO {
  firmaDigital?: string;
}

export interface RejectDTO {
  observaciones?: string;
}
