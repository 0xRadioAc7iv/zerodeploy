import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { DATABASE_URL } from "./env.ts";

const DB_URL = DATABASE_URL;

const sql = neon(DB_URL);
export const db = drizzle({ client: sql });
