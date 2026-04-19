import { app } from "../server/index";

// Endpoint de diagnostic pour Vercel
app.get("/api/debug", async (_req, res) => {
  try {
    const { db } = await import("../server/db");
    const { users } = await import("../shared/schema");
    const { sql } = await import("drizzle-orm");
    const path = await import("path");
    const fs = await import("fs");

    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    const migrationsExist = fs.existsSync(path.join(process.cwd(), "migrations"));
    const migrationFiles = migrationsExist ? fs.readdirSync(path.join(process.cwd(), "migrations")) : [];

    res.json({ 
      status: "ok", 
      database: "connected", 
      tables: tables.map((t: any) => t.table_name),
      migrations: {
        exist: migrationsExist,
        files: migrationFiles
      },
      env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      stack: error.stack
    });
  }
});

export default app;
