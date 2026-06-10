import { mysqlTable, int, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { relations , sql} from "drizzle-orm";
import { trabajadores } from "./workers";
import { planillas } from "./catalogs";

export const trabajadoresPlanillas = mysqlTable(
  "trabajadores_planillas",
  {
    trabajadorId: int("trabajador_id")
      .notNull()
      .references(() => trabajadores.id),
    planillaId: int("planilla_id")
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

