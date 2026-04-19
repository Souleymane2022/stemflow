import { app } from "../server/index";

// Endpoint de diagnostic pour Vercel
app.get("/api/debug", async (_req, res) => {
  try {
    const { db } = await import("../server/db");
    const { users } = await import("../shared/schema");
    const userCount = await db.select({ count: (await import("drizzle-orm")).count() }).from(users);
    res.json({ 
      status: "ok", 
      database: "connected", 
      userCount: userCount[0].count,
      env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      stack: error.stack
    });
  }
});

export default app;
