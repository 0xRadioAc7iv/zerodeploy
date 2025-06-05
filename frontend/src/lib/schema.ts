import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: text().notNull(),
  email: text().notNull().unique(),
  userAvatarUrl: text().notNull(),
});
