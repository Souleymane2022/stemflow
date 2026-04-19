import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL must be set. On Vercel, please connect a Postgres database.");
}

const queryClient = postgres(dbUrl, { ssl: 'require' });
export const db = drizzle(queryClient, { schema });
