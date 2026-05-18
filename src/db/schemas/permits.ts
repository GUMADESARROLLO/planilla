import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  text,
  date,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { trabajadores } from "./workers";
import { tiposPermisos } from "./catalogs";
import { usuarios } from "./users";

const auditColumns = {
  created_at: timestamp("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: timestamp("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`).onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const esquelasPermisos = mysqlTable("esquelas_permisos", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  fechaElaborada: timestamp("fecha_elaborada").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  trabajadorId: char("trabajador_id", { length: 36 })
    .notNull()
    .references(() => trabajadores.id),
  cargo: varchar("cargo", { length: 255 }),
  ubicacion: varchar("ubicacion", { length: 255 }).notNull(),
  tipoPermisoId: char("tipo_permiso_id", { length: 36 })
    .notNull()
    .references(() => tiposPermisos.id),
  cantidadDias: int("cantidad_dias").notNull(),
  periodoCorrespondiente: varchar("periodo_correspondiente", {
    length: 255,
  }).notNull(),
  fechaIncorporacion: date("fecha_incorporacion").notNull(),
  observaciones: text("observaciones"),
  estado: mysqlEnum("estado", ["pendiente", "aprobada", "rechazada"])
    .notNull()
    .default("pendiente"),
  aprobadoPor: char("aprobado_por", { length: 36 }).references(
    () => usuarios.id
  ),
  firmaDigital: text("firma_digital"),
  ...auditColumns,
});

// ---- Relations ----

export const esquelasPermisosRelations = relations(
  esquelasPermisos,
  ({ one }) => ({
    trabajador: one(trabajadores, {
      fields: [esquelasPermisos.trabajadorId],
      references: [trabajadores.id],
    }),
    tipoPermiso: one(tiposPermisos, {
      fields: [esquelasPermisos.tipoPermisoId],
      references: [tiposPermisos.id],
    }),
    aprobadoPor: one(usuarios, {
      fields: [esquelasPermisos.aprobadoPor],
      references: [usuarios.id],
    }),
  })
);


