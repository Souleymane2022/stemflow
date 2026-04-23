import express from "express";

let app;
let loadError = null;

try {
  // On essaie de charger l'app principale
  // On utilise un import dynamique pour attraper l'erreur si un module manque ou si les alias plantent
  const { app: mainApp, setupServer } = await import("../server/index");
  app = mainApp;
  
  // On tente l'initialisation
  await setupServer(app);
} catch (err) {
  console.error("CRITICAL LOAD ERROR:", err);
  loadError = err;
}

const api = express();

api.use((req, res, next) => {
  if (loadError) {
    return res.status(500).json({ 
      error: "Failed to load server modules", 
      message: loadError.message,
      stack: loadError.stack,
      hint: "Check if all dependencies are installed and aliases are working"
    });
  }
  if (!app) {
    return res.status(500).json({ error: "Express app not initialized" });
  }
  // On délégue à l'app principale
  app(req, res, next);
});

export default api;