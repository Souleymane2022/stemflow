import { app as mainApp, setupServer } from "../server/index";

let initialized = false;
let initError: any = null;

async function ensureInitialized() {
  if (initialized) return;
  if (initError) throw initError;

  try {
    console.log("Initializing server components...");
    await setupServer(mainApp);
    initialized = true;
    console.log("Server components initialized successfully.");
  } catch (err: any) {
    initError = err;
    console.error("Initialization failed:", err);
    throw err;
  }
}

// Basic health check
mainApp.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    initialized, 
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Diagnostic endpoint
mainApp.get("/api/debug", async (req, res) => {
  try {
    await ensureInitialized();
    res.json({ 
      status: "ok", 
      message: "Server initialized and connected",
      database: !!process.env.DATABASE_URL
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Main middleware
mainApp.use(async (req, res, next) => {
  // Skip initialization for static files if possible, 
  // but Express handles them after this middleware in this setup.
  if (req.path.startsWith("/api")) {
    try {
      await ensureInitialized();
      next();
    } catch (error: any) {
      console.error("API Init Error:", error.message);
      res.status(500).json({ 
        error: "Server initialization failed", 
        details: error.message 
      });
    }
  } else {
    next();
  }
});

export default mainApp;