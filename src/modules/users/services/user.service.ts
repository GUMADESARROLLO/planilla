import { randomBytes, scryptSync, randomUUID } from "node:crypto";
import { db } from "@db/index";
import { authUser } from "@db/schemas/auth-schemas";
import { eq, desc, like, and, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { CreateUserDTO, UpdateUserDTO, UserResponse } from "../types";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

function mapUser(row: any): UserResponse {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role ?? null,
    activo: row.activo ?? true,
    nombre: row.nombre ?? null,
    apellidos: row.apellidos ?? null,
    emailVerified: row.emailVerified ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findAll(filters: { search?: string; page?: number; limit?: number }): Promise<{ data: UserResponse[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
  const conditions: any[] = [];

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(authUser.name, term),
        like(authUser.email, term),
        like(authUser.nombre, term),
        like(authUser.apellidos, term),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(authUser)
      .where(where)
      .orderBy(desc(authUser.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ total: sql<number>`count(*)` })
      .from(authUser)
      .where(where)
      .then((r) => Number(r[0]?.total ?? 0)),
  ]);

  return {
    data: rows.map(mapUser),
    total: countResult,
    page,
    limit,
  };
}

export async function findById(id: string): Promise<UserResponse | null> {
  const [row] = await db
    .select()
    .from(authUser)
    .where(eq(authUser.id, id))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function create(data: CreateUserDTO): Promise<UserResponse> {
  const id = `usr-${randomUUID().slice(0, 8)}`;
  const passwordHash = hashPassword(data.password);
  const now = new Date();

  await db.execute(
    sql`INSERT INTO \`user\` (id, email, name, emailVerified, role, activo, nombre, apellidos, createdAt, updatedAt)
        VALUES (${id}, ${data.email}, ${data.name}, false, ${data.role ?? "USER"}, ${data.activo ?? true}, ${data.nombre ?? null}, ${data.apellidos ?? null}, ${now}, ${now})`
  );

  await db.execute(
    sql`INSERT INTO \`account\` (id, accountId, providerId, userId, password, createdAt, updatedAt)
        VALUES (${`acc-${randomUUID().slice(0, 8)}`}, ${`acc-${randomUUID().slice(0, 8)}`}, 'credential', ${id}, ${passwordHash}, ${now}, ${now})`
  );

  const created = await findById(id);
  return created!;
}

export async function update(id: string, data: UpdateUserDTO): Promise<UserResponse | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const updateData: any = {};
  if (data.email !== undefined) updateData["email"] = data.email;
  if (data.name !== undefined) updateData["name"] = data.name;
  if (data.role !== undefined) updateData["role"] = data.role;
  if (data.activo !== undefined) updateData["activo"] = data.activo;
  if (data.nombre !== undefined) updateData["nombre"] = data.nombre;
  if (data.apellidos !== undefined) updateData["apellidos"] = data.apellidos;
  updateData["updatedAt"] = new Date();

  if (Object.keys(updateData).length > 1) {
    await db
      .update(authUser)
      .set(updateData)
      .where(eq(authUser.id, id));
  }

  return findById(id);
}

export async function softDelete(id: string): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .update(authUser)
    .set({ activo: false, updatedAt: new Date() } as any)
    .where(eq(authUser.id, id));

  return true;
}
