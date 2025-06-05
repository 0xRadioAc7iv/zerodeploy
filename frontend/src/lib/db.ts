import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const DB_URL = process.env.DATABASE_URL as string;

const sql = neon(DB_URL);
export const db = drizzle({ client: sql });
