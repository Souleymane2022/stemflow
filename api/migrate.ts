import { db } from "../server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

export default async function handler(req, res) {
  try {
    console.log("Starting independent migration process...");
    
    // Chemin absolu pour Vercel
    const migrationsFolder = path.resolve(process.cwd(), "migrations");
    
    console.log("Migrations folder:", migrationsFolder);
    
    await migrate(db, { migrationsFolder });
    
    res.status(200).json({ 
      success: true, 
      message: "Migration réussie ! Toutes les tables ont été créées dans Neon.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Migration fatal error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      suggestion: "Vérifiez que DATABASE_URL est bien renseigné dans Vercel."
    });
  }
}
