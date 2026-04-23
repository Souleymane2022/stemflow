import { app, setupServer } from "../server/index";

let initialized = false;

export default async function handler(req, res) {
  try {
    if (!initialized) {
      console.log("Initializing server with database...");
      await setupServer(app);
      initialized = true;
    }
    return app(req, res);
  } catch (error) {
    console.error("DETAILED SERVER ERROR:", error);
    // On affiche l'erreur en clair pour aider l'utilisateur
    res.status(500).json({ 
      error: "Base de données ou Initialisation en échec", 
      message: error.message,
      suggestion: "Vérifiez vos variables d'environnement DATABASE_URL sur Vercel."
    });
  }
}