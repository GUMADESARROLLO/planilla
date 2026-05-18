import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";

const host = process.env["DB_HOST"] ?? "localhost";
const port = Number(process.env["DB_PORT"] ?? 3306);
const user = process.env["DB_USER"] ?? "root";
const password = process.env["DB_PASSWORD"] ?? "";
const database = process.env["DB_NAME"] ?? "planilla_hr";

const conn = await mysql.createConnection({
  host, port, user, password,
  multipleStatements: true, connectTimeout: 10000,
});

await conn.query(`DROP DATABASE IF EXISTS \`${database}\``);
await conn.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await conn.query(`USE \`${database}\``);

const rawSql = fs.readFileSync("src/db/migrations/0000_ambiguous_gauntlet.sql", "utf8");
const statements = rawSql.split("--> statement-breakpoint").map(s => s.trim()).filter(s => s.length > 0);

console.log(`Executing ${statements.length} statements...`);
for (let i = 0; i < statements.length; i++) {
  try {
    await conn.query(statements[i]);
    console.log(`  [${i+1}/${statements.length}] OK`);
  } catch (e) {
    console.error(`  [${i+1}/${statements.length}] ERROR:`, e.message.substring(0, 120));
  }
}

const [tables] = await conn.query("SHOW TABLES");
console.log(`Tables (${tables.length}):`, tables.map(t => Object.values(t)[0]).join(", "));
await conn.end();
