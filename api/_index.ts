import { app, setupServer } from "../server/index";
import { db } from "../server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

let initialized = false;

export default async function handler(req, res) {
  const url = req.url || "";

  if (url.includes("/health")) {
    return res.status(200).json({ status: "alive", message: "Serveur configuré avec inclusion totale !" });
  }

  try {
    if (url.includes("/migrate")) {
       const migrationsFolder = path.resolve(process.cwd(), "migrations");
       await migrate(db, { migrationsFolder });
       return res.status(200).json({ success: true, message: "Base de données synchronisée !" });
    }

    if (!initialized) {
      await setupServer(app);
      initialized = true;
    }
    return app(req, res);
  } catch (err) {
    console.error("Critical Runtime Error:", err);
    return res.status(500).json({ 
      error: "Crash au démarrage", 
      details: err.message,
      stack: err.stack 
    });
  }
}