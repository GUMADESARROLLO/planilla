import {
  mysqlTable,
  int,
  decimal,
  varchar,
  boolean,
  timestamp,
  text,
  date,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { trabajadores } from "./workers";
import { tiposPermisos } from "./catalogs";
import { authUser } from "./auth-schemas";

const auditColumns = {
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const esquelasPermisos = mysqlTable("esquelas_permisos", {
  id: int("id").autoincrement().primaryKey(),
  fechaElaborada: timestamp("fecha_elaborada").notNull().default(sql`CURRENT_TIMESTAMP`),
  trabajadorId: int("trabajador_id")
    .notNull()
    .references(() => trabajadores.id),
  cargo: varchar("cargo", { length: 255 }),
  ubicacion: varchar("ubicacion", { length: 255 }).notNull(),
  tipoPermisoId: int("tipo_permiso_id")
    .notNull()
    .references(() => tiposPermisos.id),
  cantidadDias: decimal("cantidad_dias", { precision: 8, scale: 2 }).notNull(),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(),
  periodoCorrespondiente: varchar("periodo_correspondiente", {
    length: 255,
  }).notNull(),
  fechaIncorporacion: date("fecha_incorporacion").notNull(),
  observaciones: text("observaciones"),
  estado: mysqlEnum("estado", ["pendiente", "aprobada", "rechazada"])
    .notNull()
    .default("pendiente"),
  aprobadoPor: varchar("aprobado_por", { length: 255 }).references(
    () => authUser.id
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
    aprobadoPor: one(authUser, {
      fields: [esquelasPermisos.aprobadoPor],
      references: [authUser.id],
    }),
  })
);

