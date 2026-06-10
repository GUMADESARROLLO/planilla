export interface CatalogEntry {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
  [key: string]: unknown;
}

export interface CatalogTableInfo {
  type: string;
  displayName: string;
  icon: string;
  entryCount: number;
}

export interface CatalogFilters {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CatalogConfig {
  table: unknown;
  displayName: string;
  icon: string;
  sortOrder: number;
}

export type CatalogType =
  | "tipos_contrato"
  | "cargos"
  | "generos"
  | "nacionalidades"
  | "planillas"
  | "tallas_camisa"
  | "tallas_pantalon"
  | "tipos_permisos"
  | "roles"
  | "unidades_negocio"
  | "departamentos";
