import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
  text,
  date,
  decimal,
} from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import {
  tiposContrato,
  cargos,
  generos,
  nacionalidades,
  tallasCamisa,
  tallasPantalon,
  departamentos,
  horarios,
  municipios,
  tiposMoneda,
  formasPago,
} from "./catalogs";
import { trabajadoresPlanillas } from "./workers_planillas";

const auditColumns = {
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  deleted_at: timestamp("deleted_at"),
};

export const trabajadores = mysqlTable("trabajadores", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  fechaEntrada: date("fecha_entrada").notNull(),
  fechaSalida: date("fecha_salida"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nacionalidadId: int("nacionalidad_id")
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
  tallaCamisaId: int("talla_camisa_id")
    .notNull()
    .references(() => tallasCamisa.id),
  tallaPantalonId: int("talla_pantalon_id")
    .notNull()
    .references(() => tallasPantalon.id),
  direccion: text("direccion"),
  tipoContratoId: int("tipo_contrato_id")
    .notNull()
    .references(() => tiposContrato.id),
  cargoId: int("cargo_id")
    .notNull()
    .references(() => cargos.id),
  generoId: int("genero_id")
    .notNull()
    .references(() => generos.id),
  activo: boolean("activo").notNull().default(true),
  foto: varchar("foto", { length: 500 }),
  salarioBase: decimal("salario_base", { precision: 10, scale: 2 }).default("0.00"),
  horarioId: int("horario_id").references(() => horarios.id),
  municipioId: int("municipio_id").references(() => municipios.id),
  tipoMonedaId: int("tipo_moneda_id").references(() => tiposMoneda.id),
  formaPagoId: int("forma_pago_id").references(() => formasPago.id),
  cuentaNomina: varchar("cuenta_nomina", { length: 100 }),
  sueldoEmbargable: boolean("sueldo_embargable").default(false),
  sueldoEmbargablePorcentaje: decimal("sueldo_embargable_porcentaje", { precision: 5, scale: 2 }),
  depreciacionVehicular: boolean("depreciacion_vehicular").default(false),
  depreciacionMontoAplicar: varchar("depreciacion_monto_aplicar", { length: 50 }),
  depreciacionMontoFijo: boolean("depreciacion_monto_fijo").default(false),
  depreciacionDolar: boolean("depreciacion_dolar").default(false),
  descripcionVehiculo: varchar("descripcion_vehiculo", { length: 255 }),
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
  horario: one(horarios, {
    fields: [trabajadores.horarioId],
    references: [horarios.id],
  }),
  municipio: one(municipios, {
    fields: [trabajadores.municipioId],
    references: [municipios.id],
  }),
  planillas: many(trabajadoresPlanillas),
}));

