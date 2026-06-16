import { mysqlTable, int, varchar, boolean, timestamp, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { trabajadores } from "./workers";
import { planillas } from "./catalogs";

export const planillaDetalle = mysqlTable("planilla_detalle", {
  id: int("id").autoincrement().primaryKey(),
  planillaId: int("planilla_id").notNull().references(() => planillas.id),
  trabajadorId: int("trabajador_id").notNull().references(() => trabajadores.id),

  salarioOrdinario: decimal("salario_ordinario", { precision: 10, scale: 2 }).default("0.00"),
  hrsExtras: decimal("hrs_extras", { precision: 8, scale: 2 }).default("0.00"),
  montoHrsExtras: decimal("monto_hrs_extras", { precision: 10, scale: 2 }).default("0.00"),
  ingresoGravable: decimal("ingreso_gravable", { precision: 10, scale: 2 }).default("0.00"),
  ingresoNoGravable: decimal("ingreso_no_gravable", { precision: 10, scale: 2 }).default("0.00"),

  diasVacDescanso: decimal("dias_vac_descanso", { precision: 8, scale: 2 }).default("0.00"),
  montoVacDescanso: decimal("monto_vac_descanso", { precision: 10, scale: 2 }).default("0.00"),
  diasSubMaternidad: decimal("dias_sub_maternidad", { precision: 8, scale: 2 }).default("0.00"),
  montoSubMaternidad: decimal("monto_sub_maternidad", { precision: 10, scale: 2 }).default("0.00"),
  diasSubsidio: decimal("dias_subsidio", { precision: 8, scale: 2 }).default("0.00"),
  montoSubEstatal: decimal("monto_sub_estatal", { precision: 10, scale: 2 }).default("0.00"),
  diasLaborados: decimal("dias_laborados", { precision: 8, scale: 2 }).default("15.00"),

  hrsDeducir: decimal("hrs_deducir", { precision: 8, scale: 2 }).default("0.00"),
  montoHrsDeducir: decimal("monto_hrs_deducir", { precision: 10, scale: 2 }).default("0.00"),
  inssLaboral: decimal("inss_laboral", { precision: 10, scale: 2 }).default("0.00"),
  ir: decimal("ir", { precision: 10, scale: 2 }).default("0.00"),
  deducVarias: decimal("deduc_varias", { precision: 10, scale: 2 }).default("0.00"),

  totalIngreso: decimal("total_ingreso", { precision: 10, scale: 2 }).default("0.00"),
  totalDeducciones: decimal("total_deducciones", { precision: 10, scale: 2 }).default("0.00"),
  netoPagar: decimal("neto_pagar", { precision: 10, scale: 2 }).default("0.00"),
  reposoLaboral: boolean("reposo_laboral").default(false),

  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});
