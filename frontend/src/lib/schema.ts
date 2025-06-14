import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: text().notNull(),
  email: text().notNull().unique(),
  userAvatarUrl: text().notNull(),
  createdAt: timestamp().defaultNow(),
});

export const projectsTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: text().notNull(),
  repository: text().notNull(),
  deployedUrl: text().unique(),
  createdAt: timestamp().defaultNow(),
});

export const deploymentsTable = pgTable("deployments", {
  id: uuid().primaryKey().unique(),
  projectId: uuid()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  status: text().notNull().default("queued"),
  timeToReady: integer().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});
