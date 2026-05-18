import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const [tables] = await conn.query("SHOW TABLES");
console.log("Tables:", tables.map(t => Object.values(t)[0]).join(", "));

await conn.end();
