import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schemas/*",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "mysql://root:root@localhost:3306/planilla_hr",
  },
  verbose: true,
  strict: true,
});
