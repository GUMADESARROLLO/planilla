import {
  mysqlTable,
  int,
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
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const unidadesNegocio = mysqlTable("unidades_negocio", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const departamentos = mysqlTable("departamentos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  unidadNegocioId: int("unidad_negocio_id")
    .notNull()
    .references(() => unidadesNegocio.id),
  ...auditColumns,
});

export const deptosNi = mysqlTable("deptos_ni", {
  id: int("id").autoincrement().primaryKey(),
  zona: varchar("zona", { length: 100 }).notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  cabecera: varchar("cabecera", { length: 255 }).notNull(),
  iso: varchar("iso", { length: 10 }).notNull(),
  ...auditColumns,
});

export const municipios = mysqlTable("municipios", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  deptoNiId: int("depto_ni_id")
    .notNull()
    .references(() => deptosNi.id),
  ...auditColumns,
});

export const horarios = mysqlTable("horarios", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  horaInicio: varchar("hora_inicio", { length: 5 }).notNull(),
  horaFin: varchar("hora_fin", { length: 5 }).notNull(),
  ...auditColumns,
});

export const cargos = mysqlTable("cargos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  unidadNegocioId: int("unidad_negocio_id")
    .references(() => unidadesNegocio.id),
  departamentoId: int("departamento_id")
    .references(() => departamentos.id),
  ...auditColumns,
});

export const generos = mysqlTable("generos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const nacionalidades = mysqlTable("nacionalidades", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  codigoIso: varchar("codigo_iso", { length: 10 }),
  ...auditColumns,
});

export const planillas = mysqlTable("planillas", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  tipo: mysqlEnum("tipo", [
    "quincenal",
    "mensual",
    "vehicular",
    "administrativa",
    "temporal",
  ]).notNull(),
  unidadNegocioId: int("unidad_negocio_id")
    .references(() => unidadesNegocio.id),
  fechaDesde: timestamp("fecha_desde"),
  fechaHasta: timestamp("fecha_hasta"),
  codigo: varchar("codigo", { length: 50 }),
  ...auditColumns,
});

export const tallasCamisa = mysqlTable("tallas_camisa", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const tallasPantalon = mysqlTable("tallas_pantalon", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  ...auditColumns,
});

export const tiposPermisos = mysqlTable("tipos_permisos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  ...auditColumns,
});

export const tiposMoneda = mysqlTable("tipos_moneda", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 10 }),
  ...auditColumns,
});

export const formasPago = mysqlTable("formas_pago", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  ...auditColumns,
});

// ---- Relations (inverse side of foreign keys) ----

export const tiposContratoRelations = relations(tiposContrato, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const unidadesNegocioRelations = relations(unidadesNegocio, ({ many }) => ({
  departamentos: many(departamentos),
  cargos: many(cargos),
}));

export const departamentosRelations = relations(departamentos, ({ one, many }) => ({
  unidadNegocio: one(unidadesNegocio, {
    fields: [departamentos.unidadNegocioId],
    references: [unidadesNegocio.id],
  }),
  trabajadores: many(trabajadores),
}));

export const horariosRelations = relations(horarios, ({ many }) => ({
  trabajadores: many(trabajadores),
}));

export const cargosRelations = relations(cargos, ({ one, many }) => ({
  trabajadores: many(trabajadores),
  unidadNegocio: one(unidadesNegocio, {
    fields: [cargos.unidadNegocioId],
    references: [unidadesNegocio.id],
  }),
  departamento: one(departamentos, {
    fields: [cargos.departamentoId],
    references: [departamentos.id],
  }),
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


