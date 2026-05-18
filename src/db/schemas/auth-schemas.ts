import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const authUser = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
    role: varchar("role", { length: 255 }).default("USER"),
    activo: boolean("activo").notNull().default(true),
    nombre: varchar("nombre", { length: 255 }),
    apellidos: varchar("apellidos", { length: 255 }),
  },
);

export const authSession = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: text("userAgent"),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const authAccount = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    accountId: varchar("accountId", { length: 255 }).notNull(),
    providerId: varchar("providerId", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const authVerification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
