import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  text,
  date,
  decimal,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import {
  tiposContrato,
  cargos,
  generos,
  nacionalidades,
  tallasCamisa,
  tallasPantalon,
} from "./catalogs";
import { trabajadoresPlanillas } from "./workers_planillas";

const auditColumns = {
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const trabajadores = mysqlTable("trabajadores", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  fechaEntrada: date("fecha_entrada").notNull(),
  fechaSalida: date("fecha_salida"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nacionalidadId: char("nacionalidad_id", { length: 36 })
    .notNull()
    .references(() => nacionalidades.id),
  numeroInss: varchar("numero_inss", { length: 50 }).notNull().unique(),
  cedulaIdentidad: varchar("cedula_identidad", { length: 50 })
    .notNull()
    .unique(),
  telefono: varchar("telefono", { length: 50 }).notNull(),
  saldoVacaciones: decimal("saldo_vacaciones", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  tallaCamisaId: char("talla_camisa_id", { length: 36 })
    .notNull()
    .references(() => tallasCamisa.id),
  tallaPantalonId: char("talla_pantalon_id", { length: 36 })
    .notNull()
    .references(() => tallasPantalon.id),
  direccion: text("direccion"),
  tipoContratoId: char("tipo_contrato_id", { length: 36 })
    .notNull()
    .references(() => tiposContrato.id),
  cargoId: char("cargo_id", { length: 36 })
    .notNull()
    .references(() => cargos.id),
  generoId: char("genero_id", { length: 36 })
    .notNull()
    .references(() => generos.id),
  activo: boolean("activo").notNull().default(true),
  foto: varchar("foto", { length: 500 }),
  ...auditColumns,
});

// ---- Relations ----

export const trabajadoresRelations = relations(trabajadores, ({ one, many }) => ({
  nacionalidad: one(nacionalidades, {
    fields: [trabajadores.nacionalidadId],
    references: [nacionalidades.id],
  }),
  tallaCamisa: one(tallasCamisa, {
    fields: [trabajadores.tallaCamisaId],
    references: [tallasCamisa.id],
  }),
  tallaPantalon: one(tallasPantalon, {
    fields: [trabajadores.tallaPantalonId],
    references: [tallasPantalon.id],
  }),
  tipoContrato: one(tiposContrato, {
    fields: [trabajadores.tipoContratoId],
    references: [tiposContrato.id],
  }),
  cargo: one(cargos, {
    fields: [trabajadores.cargoId],
    references: [cargos.id],
  }),
  genero: one(generos, {
    fields: [trabajadores.generoId],
    references: [generos.id],
  }),
  planillas: many(trabajadoresPlanillas),
}));
