import { db } from "@db/index";
import {
  eq,
  like,
  count,
  desc,
  and,
  isNull,
  getTableColumns,
} from "drizzle-orm";
import type { CatalogEntry, CatalogFilters, PaginatedResult } from "../types";

export class CatalogRepository {
  async findAll(
    table: any,
    filters: CatalogFilters = {},
  ): Promise<PaginatedResult<CatalogEntry>> {
    const conditions: any[] = [isNull(table.deleted_at)];

    if (filters.search) {
      conditions.push(like(table.nombre, `%${filters.search}%`));
    }
    if (filters.activo !== undefined) {
      conditions.push(eq(table.activo, filters.activo));
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const where = and(...conditions);

    const [countResult] = await db
      .select({ count: count() })
      .from(table)
      .where(where)
      .execute();

    const total = Number(countResult?.count ?? 0);

    const data = await db
      .select()
      .from(table)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(table.created_at))
      .execute();

    return {
      data: data as unknown as CatalogEntry[],
      total,
      page,
      limit,
    };
  }

  async findById(table: any, id: string): Promise<CatalogEntry | null> {
    const [result] = await db
      .select()
      .from(table)
      .where(and(eq(table.id, id), isNull(table.deleted_at)))
      .limit(1)
      .execute();
    return (result as unknown as CatalogEntry) ?? null;
  }

  async create(
    table: any,
    data: Partial<CatalogEntry>,
  ): Promise<CatalogEntry> {
    const columns = getTableColumns(table);
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key in columns),
    );

    await db.insert(table).values(filteredData).execute();

    if (data.id) {
      const created = await this.findById(table, data.id);
      if (created) return created;
    }

    const [last] = await db
      .select()
      .from(table)
      .where(isNull(table.deleted_at))
      .orderBy(desc(table.created_at))
      .limit(1)
      .execute();
    return last as unknown as CatalogEntry;
  }

  async update(
    table: any,
    id: string,
    data: Partial<CatalogEntry>,
  ): Promise<CatalogEntry | null> {
    const columns = getTableColumns(table);
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key in columns),
    );

    await db
      .update(table)
      .set({ ...filteredData, updated_at: new Date() } as any)
      .where(eq(table.id, id))
      .execute();

    return this.findById(table, id);
  }

  async softDelete(table: any, id: string): Promise<void> {
    await db
      .update(table)
      .set({ deleted_at: new Date() } as any)
      .where(eq(table.id, id))
      .execute();
  }

  async count(
    table: any,
    filters: { search?: string; activo?: boolean } = {},
  ): Promise<number> {
    const conditions: any[] = [isNull(table.deleted_at)];
    if (filters.search) {
      conditions.push(like(table.nombre, `%${filters.search}%`));
    }
    if (filters.activo !== undefined) {
      conditions.push(eq(table.activo, filters.activo));
    }

    const [result] = await db
      .select({ count: count() })
      .from(table)
      .where(and(...conditions))
      .execute();
    return Number(result?.count ?? 0);
  }
}

export const catalogRepository = new CatalogRepository();
