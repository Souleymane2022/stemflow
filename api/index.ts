import { db } from "../server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

// Important: Dynamic import of the app to avoid top-level issues
const getApp = async () => {
    const { app, setupServer } = await import("../server/index");
    await setupServer(app);
    return app;
};

let initializedApp: any = null;

let initialized = false;

export default async function handler(req, res) {
  // 0. Route de test rapide
  if (req.url.includes("/health")) {
    return res.status(200).json({ status: "alive", message: "Le serveur répond !" });
  }

  // 1. Route de migration PRIORITAIRE
  if (req.url.includes("/migrate")) {
    try {
      console.log("Migration requested...");
      const migrationsFolder = path.resolve(process.cwd(), "migrations");
      await migrate(db, { migrationsFolder });
      return res.status(200).json({ success: true, message: "Base de données Neon initialisée !" });
    } catch (err) {
      console.error("Migration Fatal Error:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        stack: err.stack,
        pathTried: path.resolve(process.cwd(), "migrations")
      });
    }
  }

  // 2. Initialisation paresseuse du serveur
  try {
    if (!initializedApp) {
      initializedApp = await getApp();
    }
    // 3. Délégation à Express
    return initializedApp(req, res);
  } catch (error) {
    console.error("Initialization Error:", error);
    res.status(500).json({ error: "Server Initialization Failed", details: error.message });
  }
}