export enum EstadoPermiso {
  PENDIENTE = "pendiente",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
}

export interface CreateEsquelaDTO {
  trabajadorId: string;
  cargo?: string;
  ubicacion: string;
  tipoPermisoId: string;
  cantidadDias: number;
  periodoCorrespondiente: string;
  fechaIncorporacion: string;
  observaciones?: string;
}

export interface UpdateEsquelaDTO {
  cargo?: string;
  ubicacion?: string;
  tipoPermisoId?: string;
  cantidadDias?: number;
  periodoCorrespondiente?: string;
  fechaIncorporacion?: string;
  observaciones?: string;
}

export interface EsquelaResponse {
  id: string;
  fechaElaborada: string;
  trabajadorId: string;
  trabajador?: {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    cedulaIdentidad: string;
    telefono: string;
    cargo: string;
  } | null;
  cargo: string | null;
  ubicacion: string;
  tipoPermisoId: string;
  tipoPermiso?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
  cantidadDias: number;
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
  trabajadorId?: string;
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
