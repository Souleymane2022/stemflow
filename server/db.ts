import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

let _db: any = null;

export const db = new Proxy({} as any, {
  get(_, prop) {
    if (!_db) {
      const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (!connectionString) {
        console.error("CRITICAL: DATABASE_URL or POSTGRES_URL is missing!");
        throw new Error("Missing database environment variables. Please check Vercel Environment Variables.");
      }
      const client = postgres(connectionString, { ssl: "require" });
      _db = drizzle(client, { schema });
    }
    return _db[prop];
  }
});
