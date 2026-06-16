import { Building2, Layers, Clock } from "@lucide/astro";
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
  unidades_negocio: { table: schemas.unidadesNegocio, displayName: "Unidades de Negocio", icon: "Building2", sortOrder: 1 },
  departamentos: { table: schemas.departamentos, displayName: "Departamentos", icon: "Layers", sortOrder: 2 },
  cargos: { table: schemas.cargos, displayName: "Cargos", icon: "Briefcase", sortOrder: 3 },
  tipos_contrato: { table: schemas.tiposContrato, displayName: "Tipos de Contrato", icon: "FileText", sortOrder: 4 },
  generos: { table: schemas.generos, displayName: "Géneros", icon: "Users", sortOrder: 5 },
  nacionalidades: { table: schemas.nacionalidades, displayName: "Nacionalidades", icon: "Globe", sortOrder: 6 },
  tipos_planilla: { table: schemas.tiposPlanilla, displayName: "Tipos de Planilla", icon: "FileSpreadsheet", sortOrder: 7 },
  tallas_camisa: { table: schemas.tallasCamisa, displayName: "Tallas de Camisa", icon: "Shirt", sortOrder: 8 },
  tallas_pantalon: { table: schemas.tallasPantalon, displayName: "Tallas de Pantalón", icon: "Shirt", sortOrder: 9 },
  tipos_permisos: { table: schemas.tiposPermisos, displayName: "Tipos de Permisos", icon: "FileCheck", sortOrder: 10 },
  roles: { table: schemas.roles, displayName: "Roles", icon: "Shield", sortOrder: 11 },
  horarios: { table: schemas.horarios, displayName: "Horarios", icon: "Clock", sortOrder: 12 },
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

  async findById(type: string, id: number): Promise<CatalogEntry | null> {
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
    id: number,
    data: Partial<CatalogEntry>,
  ): Promise<CatalogEntry | null> {
    return catalogRepository.update(this.getTable(type), id, data);
  }

  async softDelete(type: string, id: number): Promise<void> {
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
      (CATALOG_CONFIG[a.type]?.sortOrder ?? 99) - (CATALOG_CONFIG[b.type]?.sortOrder ?? 99),
    );
  }
}

export const catalogService = new CatalogService();
