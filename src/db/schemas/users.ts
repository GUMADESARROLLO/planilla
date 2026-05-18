import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { roles } from "./catalogs";
import { esquelasPermisos } from "./permits";

const auditColumns = {
  created_at: timestamp("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: timestamp("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`).onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const usuarios = mysqlTable("usuarios", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  rolId: char("rol_id", { length: 36 })
    .notNull()
    .references(() => roles.id),
  activo: boolean("activo").notNull().default(true),
  foto: varchar("foto", { length: 500 }),
  ...auditColumns,
});

// ---- Relations ----

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  rol: one(roles, {
    fields: [usuarios.rolId],
    references: [roles.id],
  }),
  esquelasAprobadas: many(esquelasPermisos),
}));


