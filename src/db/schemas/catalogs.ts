import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  text,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { trabajadores } from "./workers";
import { trabajadoresPlanillas } from "./workers_planillas";
import { esquelasPermisos } from "./permits";


const auditColumns = {
  activo: boolean("activo").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const tiposContrato = mysqlTable("tipos_contrato", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const cargos = mysqlTable("cargos", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const generos = mysqlTable("generos", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const nacionalidades = mysqlTable("nacionalidades", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  codigoIso: varchar("codigo_iso", { length: 10 }),
  ...auditColumns,
});

export const planillas = mysqlTable("planillas", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  tipo: mysqlEnum("tipo", [
    "quincenal",
    "mensual",
    "vehicular",
    "administrativa",
    "temporal",
  ]).notNull(),
  ...auditColumns,
});

export const tallasCamisa = mysqlTable("tallas_camisa", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const tallasPantalon = mysqlTable("tallas_pantalon", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const tiposPermisos = mysqlTable("tipos_permisos", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const roles = mysqlTable("roles", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

// ---- Relations (inverse side of foreign keys) ----

export const tiposContratoRelations = relations(tiposContrato, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const cargosRelations = relations(cargos, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const generosRelations = relations(generos, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const nacionalidadesRelations = relations(
  nacionalidades,
  ({ many }) => ({
    trabajadores: many(trabajadores),
  })
);

export const planillasRelations = relations(planillas, ({ many }) => ({
  trabajadoresPlanillas: many(trabajadoresPlanillas),
}));

export const tallasCamisaRelations = relations(tallasCamisa, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const tallasPantalonRelations = relations(tallasPantalon, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const tiposPermisosRelations = relations(tiposPermisos, ({ many }) => ({
  esquelasPermisos: many(esquelasPermisos),
}));


