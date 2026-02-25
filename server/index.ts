import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

console.log("🚀 Starting STEM Flow application...");
console.log("Environment PORT:", process.env.PORT);
console.log("Environment NODE_ENV:", process.env.NODE_ENV);
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import { serveStatic } from "./static";
import { createServer } from "http";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

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

const PgStore = connectSqlite3(session);

app.use(
  session({
    store: new PgStore({ db: 'sessions.db', dir: process.env.SESSION_DIR || '.', table: 'user_sessions' }) as any,
    secret: process.env.SESSION_SECRET || "stem-flow-secret-key-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

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

(async () => {
  await seedDatabase();

  await setupAuth(app, async (claims: any, req: any) => {
    const oauthId = claims.sub;
    const email = claims.email || null;
    const firstName = claims.first_name || null;
    const lastName = claims.last_name || null;
    const profileImageUrl = claims.profile_image_url || null;
    const user = await storage.createOrLinkOAuthUser(oauthId, "replit", email, firstName, lastName, profileImageUrl);
    req.session.userId = user.id;
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
