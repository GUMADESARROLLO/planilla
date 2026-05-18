import { mysqlTable, char, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { trabajadores } from "./workers";
import { planillas } from "./catalogs";

export const trabajadoresPlanillas = mysqlTable(
  "trabajadores_planillas",
  {
    trabajadorId: char("trabajador_id", { length: 36 })
      .notNull()
      .references(() => trabajadores.id),
    planillaId: char("planilla_id", { length: 36 })
      .notNull()
      .references(() => planillas.id),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.trabajadorId, table.planillaId] }),
  })
);

// ---- Relations ----

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

