import { app, setupServer } from "../server/index";
import { db } from "../server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

let initialized = false;

export default async function handler(req, res) {
  // ROUTE SPÉCIALE POUR CRÉER LES TABLES DANS NEON
  if (req.url.endsWith("/migrate")) {
    try {
      console.log("Starting manual migration...");
      // On pointe vers le dossier des migrations à la racine
      const migrationsFolder = path.join(process.cwd(), "migrations");
      await migrate(db, { migrationsFolder });
      return res.status(200).json({ 
        success: true, 
        message: "Les tables ont été créées avec succès dans Neon !",
        folder: migrationsFolder
      });
    } catch (err) {
      console.error("Migration error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        suggestion: "Assurez-vous que DATABASE_URL est correct sur Vercel."
      });
    }
  }

  // Health check simple
  if (req.url.endsWith("/health")) {
    return res.status(200).json({ status: "alive", db_connected: !!process.env.DATABASE_URL });
  }

  try {
    if (!initialized) {
      await setupServer(app);
      initialized = true;
    }
    return app(req, res);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ 
      error: "Initialization failed", 
      message: error.message 
    });
  }
}