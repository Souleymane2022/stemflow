import { app, setupServer } from "../server/index";

let initialized = false;

export default async function handler(req, res) {
  // Test ultra-direct pour confirmer que Vercel atteint CE fichier
  if (req.url.endsWith("/ping")) {
    return res.status(200).json({ pong: true, file: "api/server.ts" });
  }

  try {
    if (!initialized) {
      console.log("Lazy loading server components...");
      await setupServer(app);
      initialized = true;
    }
    
    console.log(`Vercel Request: ${req.method} ${req.url}`);
    
    // Express app est elle-même un handler (req, res)
    return app(req, res);
  } catch (error) {
    console.error("Vercel Runtime Error:", error);
    res.status(500).json({ 
      error: "Runtime Error", 
      message: error.message
    });
  }
}