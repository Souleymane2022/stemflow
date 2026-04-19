import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import { serveStatic } from "./static";
import { createServer } from "http";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "200mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "200mb" }));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});

import rateLimit from "express-rate-limit";

app.set("trust proxy", 1);

// Configure rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  message: { message: "Trop de requêtes, veuillez réessayer plus tard." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", apiLimiter);

// Session configuration will be handled inside setupServer for production

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

import { seedDatabase } from "./seed";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";

// Variable pour s'assurer que les routes ne sont enregistrées qu'une seule fois
let serverInitialized = false;

export async function setupServer(app: express.Express) {
  if (serverInitialized) return;

  try {
    console.log("Starting server initialization sequence...");

    // Session setup for production/Vercel
    const MemoryStore = memorystore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000 
    });

    app.use(
      session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || "stem-flow-secret-key-dev",
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      })
    );
    
    // Auth setup
    await setupAuth(app, async (claims: any, req: any) => {
      const oauthId = claims.sub;
      const email = claims.email || null;
      const firstName = claims.first_name || null;
      const lastName = claims.last_name || null;
      const profileImageUrl = claims.profile_image_url || null;
      const user = await storage.createOrLinkOAuthUser(oauthId, "replit", email, firstName, lastName, profileImageUrl);
      req.session.userId = user.id;
    });

    // Create a dummy server object for registerRoutes if needed locally, or just app for some routers
    // registerRoutes expects (httpServer, app). On Vercel, we might need a workaround if it uses Ws.
    // For Vercel, we pass null as httpServer since Ws won't work anyway.
    await registerRoutes(null as any, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      serveStatic(app);
    }

    serverInitialized = true;
  } catch (error) {
    console.error("❌ Setup error:", error);
    throw error;
  }
}

// Lancement local
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  (async () => {
    try {
      const { createServer } = await import("http");
      const localHttpServer = createServer(app);
      
      const { db } = await import("./db");
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      const path = await import("path");
      
      console.log("Running local database migrations...");
      try {
        await migrate(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
      } catch (e) {
        console.error("Migration skipped or failed:", e);
      }
      
      await seedDatabase();
      
      // Local session with SQLite for persistence in dev
      const connectSqlite3 = (await import("connect-sqlite3")).default;
      const SQLiteStore = connectSqlite3(session);
      app.use(session({
        store: new SQLiteStore({ db: 'sessions.db' }),
        secret: "dev-secret",
        resave: false,
        saveUninitialized: false
      }));

      await setupServer(app);
      
      const port = parseInt(process.env.PORT || "5000", 10);
      localHttpServer.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Local server started on port ${port}`);
      });
    } catch (err) {
      console.error("Local startup error:", err);
    }
  })();
}
