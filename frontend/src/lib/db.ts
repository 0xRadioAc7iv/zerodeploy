import { env } from "@/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const DB_URL = env.DATABASE_URL;

const sql = neon(DB_URL);
export const db = drizzle({ client: sql });
