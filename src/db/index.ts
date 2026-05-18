import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schemas from "./schemas";

const pool = createPool({
  host: process.env["DB_HOST"] ?? "localhost",
  user: process.env["DB_USER"] ?? "root",
  password: process.env["DB_PASSWORD"] ?? "root",
  database: process.env["DB_NAME"] ?? "planilla_hr",
  port: Number(process.env["DB_PORT"] ?? 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env["DB_POOL_LIMIT"] ?? 10),
});

export const db = drizzle(pool, { schema: schemas, mode: "default" });
export { schemas };
export default db;
