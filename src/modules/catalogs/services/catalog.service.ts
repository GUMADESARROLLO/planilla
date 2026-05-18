import { db, schemas } from "@db/index";
import { count, isNull, and } from "drizzle-orm";
import { catalogRepository } from "../repositories/catalog.repository";
import type {
  CatalogConfig,
  CatalogEntry,
  CatalogFilters,
  CatalogTableInfo,
  PaginatedResult,
} from "../types";

export const CATALOG_CONFIG: Record<string, CatalogConfig> = {
  tipos_contrato: {
    table: schemas.tiposContrato,
    displayName: "Tipos de Contrato",
    icon: "FileText",
  },
  cargos: { table: schemas.cargos, displayName: "Cargos", icon: "Briefcase" },
  generos: { table: schemas.generos, displayName: "Géneros", icon: "Users" },
  nacionalidades: {
    table: schemas.nacionalidades,
    displayName: "Nacionalidades",
    icon: "Globe",
  },
  planillas: {
    table: schemas.planillas,
    displayName: "Planillas",
    icon: "FileSpreadsheet",
  },
  tallas_camisa: {
    table: schemas.tallasCamisa,
    displayName: "Tallas de Camisa",
    icon: "Shirt",
  },
  tallas_pantalon: {
    table: schemas.tallasPantalon,
    displayName: "Tallas de Pantalón",
    icon: "Shirt",
  },
  tipos_permisos: {
    table: schemas.tiposPermisos,
    displayName: "Tipos de Permisos",
    icon: "FileCheck",
  },
  roles: { table: schemas.roles, displayName: "Roles", icon: "Shield" },
};

class CatalogService {
  getCatalogConfig(type: string): CatalogConfig | undefined {
    return CATALOG_CONFIG[type];
  }

  private getTable(type: string): unknown {
    const config = this.getCatalogConfig(type);
    if (!config) throw new Error(`Unknown catalog type: ${type}`);
    return config.table;
  }

  async findAll(
    type: string,
    filters: CatalogFilters = {},
  ): Promise<PaginatedResult<CatalogEntry>> {
    return catalogRepository.findAll(this.getTable(type), filters);
  }

  async findById(type: string, id: string): Promise<CatalogEntry | null> {
    return catalogRepository.findById(this.getTable(type), id);
  }

  async create(
    type: string,
    data: Partial<CatalogEntry>,
  ): Promise<CatalogEntry> {
    return catalogRepository.create(this.getTable(type), data);
  }

  async update(
    type: string,
    id: string,
    data: Partial<CatalogEntry>,
  ): Promise<CatalogEntry | null> {
    return catalogRepository.update(this.getTable(type), id, data);
  }

  async softDelete(type: string, id: string): Promise<void> {
    return catalogRepository.softDelete(this.getTable(type), id);
  }

  async getCatalogsList(): Promise<CatalogTableInfo[]> {
    const entries = await Promise.all(
      Object.entries(CATALOG_CONFIG).map(async ([type, config]) => {
        const [result] = await db
          .select({ count: count() })
          .from(config.table as any)
          .where(and(isNull((config.table as any).deleted_at)))
          .execute();
        return {
          type,
          displayName: config.displayName,
          icon: config.icon,
          entryCount: Number(result?.count ?? 0),
        };
      }),
    );
    return entries.sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }
}

export const catalogService = new CatalogService();
