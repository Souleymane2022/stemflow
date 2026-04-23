import { app, setupServer } from "../server/index";

let initialized = false;

export default async function handler(req, res) {
  try {
    if (!initialized) {
      console.log("Lazy loading server components...");
      await setupServer(app);
      initialized = true;
    }
    
    // Log important pour le debug des 404
    console.log(`Vercel Request: ${req.method} ${req.url}`);
    
    // Express app est elle-même un handler (req, res)
    return app(req, res);
  } catch (error) {
    console.error("Vercel Runtime Error:", error);
    res.status(500).json({ 
      error: "Runtime Error", 
      message: error.message,
      stack: error.stack 
    });
  }
}