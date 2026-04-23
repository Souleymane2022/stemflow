import { app as mainApp, setupServer } from "../server/index";

let initialized = false;
let initError: Error | null = null;

async function ensureInitialized() {
  if (initialized) return;
  if (initError) throw initError;

  try {
    // Run migrations before starting the server
    const { db } = await import("../server/db");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const path = await import("path");

    console.log("Running database migrations...");
    try {
      await migrate(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
      console.log("Migrations complete.");
    } catch (migrationErr: any) {
      // Ignore "already exists" errors — tables already created
      if (!migrationErr.message?.includes("already exists")) {
        console.error("Migration error:", migrationErr.message);
      } else {
        console.log("Tables already exist, skipping migration.");
      }
    }

    await setupServer(mainApp);
    initialized = true;
  } catch (err: any) {
    initError = err;
    console.error("Initialization failed:", err.message);
    throw err;
  }
}

// Diagnostic endpoint
mainApp.get("/api/debug", async (req, res) => {
  try {
    await ensureInitialized();
    res.json({ status: "ok", message: "Server initialized and connected to Neon Postgres" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Lazy initialization middleware for all requests
mainApp.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (error: any) {
    console.error("Initialization error:", error.message);
    res.status(500).json({
      error: "Server initialization failed",
      details: error.message,
    });
  }
});

export default mainApp;