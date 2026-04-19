import { app as mainApp, setupServer } from "../server/index";

// Endpoint de diagnostic ultra-léger
mainApp.get("/api/debug", async (req, res) => {
  try {
    await setupServer(mainApp);
    res.json({ status: "ok", message: "Server initialized and connected to Postgres" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Middleware d'initialisation lazy sur toutes les requêtes
mainApp.use(async (req, res, next) => {
  try {
    await setupServer(mainApp);
    next();
  } catch (error) {
    console.error("Initialization error:", error);
    next(error);
  }
});

export default mainApp;
