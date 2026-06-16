import { mysqlTable, int, timestamp, uniqueIndex } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { trabajadores } from "./workers";
import { planillas } from "./catalogs";

export const trabajadoresPlanillas = mysqlTable(
  "trabajadores_planillas",
  {
    id: int("id").autoincrement().primaryKey(),
    trabajadorId: int("trabajador_id")
      .notNull()
      .references(() => trabajadores.id),
    planillaId: int("planilla_id"),
    tipoPlanillaId: int("tipo_planilla_id"),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueTrabajadorTipo: uniqueIndex("uq_trabajador_tipo").on(table.trabajadorId, table.tipoPlanillaId),
  })
);

export const trabajadoresPlanillasRelations = relations(
  trabajadoresPlanillas,
  ({ one }) => ({
    trabajador: one(trabajadores, {
      fields: [trabajadoresPlanillas.trabajadorId],
      references: [trabajadores.id],
    }),
    planilla: one(planillas, {
      fields: [trabajadoresPlanillas.planillaId],
      references: [planillas.id],
    }),
  })
);
