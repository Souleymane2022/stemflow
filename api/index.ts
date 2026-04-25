export default async function handler(req, res) {
  const url = req.url || "";

  // 1. Diagnostic de base (AUCUNE dépendance)
  if (url.includes("/health")) {
    return res.status(200).json({ 
      status: "alive", 
      message: "Le serveur tourne enfin !",
      nodeVersion: process.version,
      vercelEnv: process.env.VERCEL
    });
  }

  // 2. Migration et Serveur (Importations dynamiques pour isoler les erreurs)
  try {
    if (url.includes("/migrate")) {
       const { db } = await import("../server/db");
       const { migrate } = await import("drizzle-orm/postgres-js/migrator");
       const path = await import("path");
       const migrationsFolder = path.resolve(process.cwd(), "migrations");
       await migrate(db, { migrationsFolder });
       return res.status(200).json({ success: true, message: "Migration réussie !" });
    }

    const { app, setupServer } = await import("../server/index");
    await setupServer(app);
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